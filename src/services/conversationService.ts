import { MockConversationRepository } from '../repositories/MockConversationRepository'
import type { ConversationRepository } from '../repositories/ConversationRepository'
import type { ConversationMessage, IntakeConversation, IntakeStep } from '../types/conversation'
import { PersonService, personService } from './personService'

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

export class ConversationService {
  private readonly repository: ConversationRepository
  private readonly people: PersonService
  private readonly delayMs: number

  constructor(
    repository: ConversationRepository = new MockConversationRepository(),
    people: PersonService = personService,
    delayMs = 350,
  ) {
    this.repository = repository
    this.people = people
    this.delayMs = delayMs
  }

  list(): Promise<IntakeConversation[]> {
    return this.repository.findAll()
  }

  async reply(id: string, value: string): Promise<IntakeConversation> {
    const conversation = await this.getById(id)
    const text = value.trim()
    if (!text) throw new Error('EMPTY_MESSAGE')
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
    const fileName = 'identidade_whatsapp_demo.pdf'

    return this.repository.update(id, {
      status: 'awaiting_internal_review',
      currentStep: 'complete',
      completion: 100,
      draft: { ...conversation.draft, documents: [fileName] },
      messages: [...conversation.messages, createMessage('customer', `Documento enviado: ${fileName}`), createMessage('bot', botPrompt('complete', conversation.draft.name))],
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
      documentCount: conversation.draft.documents.length,
    })

    return this.repository.update(id, {
      status: 'approved',
      approvedPersonId: person.id,
      messages: [...conversation.messages, createMessage('system', 'Pré-cadastro validado pela equipe interna e convertido em pessoa.')],
      updatedAt: new Date().toISOString(),
    })
  }

  async resetDemo(): Promise<IntakeConversation[]> {
    await this.people.resetDemo()
    return this.repository.reset()
  }

  private async getById(id: string): Promise<IntakeConversation> {
    const conversation = await this.repository.findById(id)
    if (!conversation) throw new Error('CONVERSATION_NOT_FOUND')
    return conversation
  }
}

export const conversationService = new ConversationService()
