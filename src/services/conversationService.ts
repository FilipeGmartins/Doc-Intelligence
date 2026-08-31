import { MockConversationRepository } from '../repositories/MockConversationRepository'
import type { ConversationRepository } from '../repositories/ConversationRepository'
import type { ConversationMessage, IntakeConversation, IntakeStep } from '../types/conversation'
import { PersonService, personService } from './personService'
import { DocumentService, documentService } from './documentService'
import { DOCUMENT_CATEGORY_OPTIONS, type DocumentCategory, type DocumentRecord } from '../types/document'
import { isValidCpf, sanitizeCpf } from '../utils/personalIdentifiers'

const nextStep: Record<Exclude<IntakeStep, 'document' | 'complete'>, IntakeStep> = {
  name: 'identifier',
  identifier: 'email',
  email: 'address',
  address: 'document',
}

const completionByStep: Record<IntakeStep, number> = {
  name: 0,
  identifier: 20,
  email: 40,
  address: 60,
  document: 80,
  complete: 100,
}

function createMessage(sender: ConversationMessage['sender'], content: string): ConversationMessage {
  return { id: crypto.randomUUID(), sender, content, createdAt: new Date().toISOString() }
}

function wait(delayMs: number) {
  return new Promise((resolve) => setTimeout(resolve, delayMs))
}

function botPrompt(step: IntakeStep, name: string): string {
  const prompts: Record<IntakeStep, string> = {
    name: 'Para começar, qual é seu nome completo?',
    identifier: `Obrigado, ${name}. Informe um CPF fictício para esta demonstração.`,
    email: 'Qual e-mail devemos usar para contato?',
    address: 'Informe um endereço fictício com cidade e estado.',
    document: 'Agora envie um documento de identidade para concluir o pré-cadastro.',
    complete: 'Informações recebidas. Seu pré-cadastro aguarda validação interna.',
  }
  return prompts[step]
}

function categoryLabel(category: DocumentCategory): string {
  return DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? 'Documento'
}

function mockFileName(category: DocumentCategory, sequence: number): string {
  const names: Record<DocumentCategory, string> = {
    identity: 'identidade', proof_of_residence: 'comprovante_residencia', payslip: 'contracheque', bank_check: 'cheque',
    work_card: 'carteira_trabalho', contract: 'contrato', medical_report: 'laudo', power_of_attorney: 'procuracao', other: 'documento',
  }
  return `${names[category]}_whatsapp_revisao${sequence > 1 ? `_${sequence}` : ''}_demo.pdf`
}

export class ConversationService {
  private readonly repository: ConversationRepository
  private readonly people: PersonService
  private readonly documents: DocumentService
  private readonly delayMs: number

  constructor(
    repository: ConversationRepository = new MockConversationRepository(),
    people: PersonService = personService,
    delayMs = 350,
    documents: DocumentService = documentService,
  ) {
    this.repository = repository
    this.people = people
    this.delayMs = delayMs
    this.documents = documents
  }

  list(): Promise<IntakeConversation[]> {
    return this.repository.findAll()
  }

  async reply(id: string, value: string): Promise<IntakeConversation> {
    const conversation = await this.getById(id)
    const text = conversation.currentStep === 'identifier' ? sanitizeCpf(value) : value.trim()
    if (!text) throw new Error('EMPTY_MESSAGE')
    if (conversation.currentStep === 'identifier' && !isValidCpf(text)) throw new Error('INVALID_CPF')
    if (conversation.currentStep === 'document' || conversation.currentStep === 'complete') throw new Error('TEXT_REPLY_NOT_ALLOWED')
    await wait(this.delayMs)

    const step = conversation.currentStep
    const draft = { ...conversation.draft }
    if (step === 'name') draft.name = text
    if (step === 'identifier') draft.identifier = text
    if (step === 'email') draft.email = text
    if (step === 'address') draft.address = text

    const followingStep = nextStep[step]
    const now = new Date().toISOString()
    return this.repository.update(id, {
      displayName: draft.name || conversation.displayName,
      status: 'collecting_data',
      currentStep: followingStep,
      completion: completionByStep[followingStep],
      draft,
      messages: [...conversation.messages, createMessage('customer', text), createMessage('bot', botPrompt(followingStep, draft.name))],
      updatedAt: now,
    })
  }

  async attachMockDocument(id: string): Promise<IntakeConversation> {
    const conversation = await this.getById(id)
    if (conversation.currentStep !== 'document') throw new Error('DOCUMENT_NOT_EXPECTED')
    await wait(this.delayMs)
    const person = await this.people.createFromIntake({
      sourceReference: conversation.id,
      name: conversation.draft.name,
      identifier: conversation.draft.identifier,
      email: conversation.draft.email,
      documentCount: 0,
    })
    const requestedCategory = conversation.requestedCategory ?? person.documentRequirements?.find((category) => !person.receivedDocuments?.includes(category)) ?? 'identity'
    const sequence = (conversation.documentIds?.length ?? 0) + 1
    const fileName = mockFileName(requestedCategory, sequence)
    const upload = await this.documents.uploadForPerson([{
      file: new File(['documento fictício'], fileName, { type: 'application/pdf', lastModified: 1 }),
      personId: person.id,
      expectedCategory: requestedCategory,
    }])
    const document = upload.created[0]
    if (!document) throw new Error('DUPLICATE_DOCUMENT')
    const processed = await this.documents.process(document.id)

    return this.repository.update(id, {
      status: conversation.approvedPersonId ? 'awaiting_document_review' : 'awaiting_internal_review',
      currentStep: 'complete',
      completion: 100,
      draft: { ...conversation.draft, documents: [...conversation.draft.documents, fileName] },
      provisionalPersonId: person.id,
      documentIds: [...(conversation.documentIds ?? []), processed.id],
      requestedCategory,
      messages: [...conversation.messages, createMessage('customer', `Documento enviado: ${fileName}`), createMessage('bot', `${categoryLabel(requestedCategory)} recebido e encaminhado automaticamente para a fila de conferência interna.`)],
      updatedAt: new Date().toISOString(),
    })
  }

  async approve(id: string): Promise<IntakeConversation> {
    const conversation = await this.getById(id)
    if (conversation.status !== 'awaiting_internal_review') throw new Error('INTAKE_NOT_READY')

    const person = await this.people.createFromIntake({
      sourceReference: conversation.id,
      name: conversation.draft.name,
      identifier: conversation.draft.identifier,
      email: conversation.draft.email,
      documentCount: 0,
    })

    let documentIds = conversation.documentIds ?? []
    if (!documentIds.length && conversation.draft.documents.length) {
      const upload = await this.documents.uploadForPerson([{
        file: new File(['documento fictício'], `revisao_${conversation.draft.documents[0]}`, { type: 'application/pdf', lastModified: 1 }),
        personId: person.id,
        expectedCategory: 'identity',
      }])
      if (upload.created[0]) {
        const processed = await this.documents.process(upload.created[0].id)
        documentIds = [processed.id]
      }
    }

    return this.repository.update(id, {
      status: 'approved',
      approvedPersonId: person.id,
      provisionalPersonId: person.id,
      documentIds,
      messages: [...conversation.messages, createMessage('system', 'Pré-cadastro validado. O documento permanece na conferência e atualizará a pessoa quando for aprovado.')],
      updatedAt: new Date().toISOString(),
    })
  }

  async resetDemo(): Promise<IntakeConversation[]> {
    await this.people.resetDemo()
    await this.documents.resetDemo()
    return this.repository.reset()
  }

  async registerDocumentOutcome(document: DocumentRecord, outcome: 'approved' | 'rejected'): Promise<IntakeConversation | null> {
    const conversations = await this.repository.findAll()
    const conversation = conversations.find((item) => item.documentIds?.includes(document.id) || (
      document.personId && [item.approvedPersonId, item.provisionalPersonId].includes(document.personId)
    ))
    if (!conversation || !document.personId || !document.expectedCategory) return null

    if (outcome === 'rejected') {
      return this.repository.update(conversation.id, {
        status: 'collecting_data',
        currentStep: 'document',
        completion: 80,
        requestedCategory: document.expectedCategory,
        messages: [...conversation.messages, createMessage('bot', `${categoryLabel(document.expectedCategory)} precisa ser reenviado. Motivo: ${document.rejectionReason ?? 'arquivo inadequado para conferência'}.`)],
        updatedAt: new Date().toISOString(),
      })
    }

    const person = (await this.people.list()).find((item) => item.id === document.personId)
    if (!person) return conversation
    const nextCategory = person.documentRequirements?.find((category) => !person.receivedDocuments?.includes(category))
    if (!nextCategory) {
      return this.repository.update(conversation.id, {
        status: 'approved',
        currentStep: 'complete',
        completion: 100,
        requestedCategory: undefined,
        messages: [...conversation.messages, createMessage('bot', `${categoryLabel(document.expectedCategory)} aprovado. Todos os documentos necessários foram recebidos.`)],
        updatedAt: new Date().toISOString(),
      })
    }

    return this.repository.update(conversation.id, {
      status: 'collecting_data',
      currentStep: 'document',
      completion: 80,
      requestedCategory: nextCategory,
      messages: [...conversation.messages, createMessage('bot', `${categoryLabel(document.expectedCategory)} aprovado. Agora envie: ${categoryLabel(nextCategory)}.`)],
      updatedAt: new Date().toISOString(),
    })
  }

  private async getById(id: string): Promise<IntakeConversation> {
    const conversation = await this.repository.findById(id)
    if (!conversation) throw new Error('CONVERSATION_NOT_FOUND')
    return conversation
  }
}

export const conversationService = new ConversationService()
