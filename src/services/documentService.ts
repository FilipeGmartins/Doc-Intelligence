import { MockDocumentRepository } from '../repositories/MockDocumentRepository'
import type { DocumentRepository } from '../repositories/DocumentRepository'
import type {
  DocumentEvent,
  DocumentEventType,
  DocumentListFilters,
  DocumentRecord,
  DocumentUploadInput,
  DocumentUploadResult,
  ExtractedField,
  UpdateDocumentInput,
} from '../types/document'
import { getStatusFromConfidence } from '../utils/confidence'
import type { AIProcessor } from './AIProcessor'
import { MockAIService } from './mockAIService'
import { PersonService, personService } from './personService'

export interface DocumentServiceContract {
  upload(files: File[]): Promise<DocumentRecord[]>
  uploadForPerson(inputs: DocumentUploadInput[]): Promise<DocumentUploadResult>
  list(filters?: DocumentListFilters): Promise<DocumentRecord[]>
  getById(id: string): Promise<DocumentRecord>
  update(id: string, changes: UpdateDocumentInput): Promise<DocumentRecord>
  process(id: string): Promise<DocumentRecord>
  reprocess(id: string): Promise<DocumentRecord>
  approve(id: string): Promise<DocumentRecord>
  resetDemo(): Promise<DocumentRecord[]>
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `doc-${Date.now()}`
}

function createEvent(type: DocumentEventType, description: string, actor = 'Sistema'): DocumentEvent {
  return { id: createId(), type, description, actor, createdAt: new Date().toISOString() }
}

function fileFingerprint(input: DocumentUploadInput): string {
  const person = input.personId ?? 'unassigned'
  return `${person}:${input.file.name.toLocaleLowerCase('pt-BR')}:${input.file.size}:${input.file.lastModified}`
}

function markEditedFields(
  currentFields: ExtractedField[],
  nextFields: ExtractedField[],
): ExtractedField[] {
  return nextFields.map((nextField) => {
    const current = currentFields.find((field) => field.id === nextField.id)
    return {
      ...nextField,
      manuallyEdited: nextField.manuallyEdited || Boolean(current && current.value !== nextField.value),
    }
  })
}

export class DocumentService implements DocumentServiceContract {
  private readonly repository: DocumentRepository
  private readonly aiService: AIProcessor
  private readonly people: PersonService

  constructor(
    repository: DocumentRepository,
    aiService: AIProcessor,
    people: PersonService = personService,
  ) {
    this.repository = repository
    this.aiService = aiService
    this.people = people
  }

  async upload(files: File[]): Promise<DocumentRecord[]> {
    const result = await this.uploadForPerson(files.map((file) => ({ file })))
    return result.created
  }

  async uploadForPerson(inputs: DocumentUploadInput[]): Promise<DocumentUploadResult> {
    const now = new Date().toISOString()
    const existing = await this.repository.findAll()
    const seenFingerprints = new Set<string>()
    const duplicates: DocumentUploadResult['duplicates'] = []
    const uniqueInputs = inputs.filter((input) => {
      const fingerprint = fileFingerprint(input)
      const duplicate = existing.find((document) => document.fingerprint === fingerprint || (
        document.personId === input.personId &&
        document.originalFileName.toLocaleLowerCase('pt-BR') === input.file.name.toLocaleLowerCase('pt-BR') &&
        document.sizeInBytes === input.file.size
      ))
      if (!duplicate && !seenFingerprints.has(fingerprint)) {
        seenFingerprints.add(fingerprint)
        return true
      }
      duplicates.push({ fileName: input.file.name, existingDocumentId: duplicate?.id ?? 'same-batch' })
      return false
    })

    const documents = uniqueInputs.map<DocumentRecord>(({ file, personId, expectedCategory }) => ({
      id: createId(),
      originalFileName: file.name,
      suggestedFileName: '',
      mimeType: file.type,
      sizeInBytes: file.size,
      documentType: 'Aguardando processamento',
      status: 'pending',
      confidence: null,
      extractedFields: [],
      createdAt: now,
      updatedAt: now,
      previewUrl: typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : undefined,
      personId,
      expectedCategory,
      fingerprint: fileFingerprint({ file, personId, expectedCategory }),
      events: [createEvent('uploaded', personId ? 'Documento recebido e vinculado ao cliente.' : 'Documento recebido sem cliente vinculado.', 'Ana Souza')],
    }))

    return { created: await this.repository.createMany(documents), duplicates }
  }

  list(filters?: DocumentListFilters): Promise<DocumentRecord[]> {
    return this.repository.findAll(filters)
  }

  async getById(id: string): Promise<DocumentRecord> {
    const document = await this.repository.findById(id)
    if (!document) throw new Error('DOCUMENT_NOT_FOUND')
    return document
  }

  async update(id: string, changes: UpdateDocumentInput): Promise<DocumentRecord> {
    const current = await this.getById(id)
    const extractedFields = changes.extractedFields
      ? markEditedFields(current.extractedFields, changes.extractedFields)
      : undefined

    const manuallyEdited = Boolean(extractedFields?.some((field) => field.manuallyEdited && !current.extractedFields.find((item) => item.id === field.id)?.manuallyEdited))
    return this.repository.update(id, {
      ...changes,
      ...(extractedFields ? { extractedFields } : {}),
      ...(manuallyEdited ? { events: [...current.events, createEvent('manually_edited', 'Campos extraídos foram corrigidos manualmente.', 'Ana Souza')] } : {}),
      updatedAt: new Date().toISOString(),
    })
  }

  async process(id: string): Promise<DocumentRecord> {
    const current = await this.getById(id)
    await this.repository.update(id, {
      status: 'processing',
      processingError: undefined,
      events: [...current.events, createEvent('processing_started', 'Processamento simulado iniciado.', 'Processamento simulado')],
      updatedAt: new Date().toISOString(),
    })

    try {
      const processing = await this.getById(id)
      const result = await this.aiService.process(current.originalFileName, current.expectedCategory)
      const status = getStatusFromConfidence(result.confidence)
      return this.repository.update(id, {
        ...result,
        status,
        processingError: undefined,
        events: [...processing.events, createEvent(status === 'review_required' ? 'review_required' : 'processed', status === 'review_required' ? 'Baixa confiança detectada; conferência humana solicitada.' : 'Documento classificado e extraído com alta confiança.', 'Processamento simulado')],
        updatedAt: new Date().toISOString(),
      })
    } catch {
      const processing = await this.getById(id)
      return this.repository.update(id, {
        status: 'failed',
        confidence: null,
        processingError: 'Não foi possível processar este documento.',
        events: [...processing.events, createEvent('failed', 'Falha simulada durante o processamento.', 'Processamento simulado')],
        updatedAt: new Date().toISOString(),
      })
    }
  }

  async reprocess(id: string): Promise<DocumentRecord> {
    const document = await this.getById(id)
    if (!['failed', 'review_required'].includes(document.status)) {
      throw new Error('INVALID_STATUS_TRANSITION')
    }
    return this.process(id)
  }

  async approve(id: string): Promise<DocumentRecord> {
    const document = await this.getById(id)
    if (!['processed', 'review_required'].includes(document.status)) {
      throw new Error('INVALID_STATUS_TRANSITION')
    }

    const now = new Date().toISOString()
    const approved = await this.repository.update(id, {
      status: 'approved',
      approvedAt: now,
      events: [...document.events, createEvent('approved', 'Documento conferido e aprovado.', 'Ana Souza')],
      updatedAt: now,
    })
    if (approved.personId && approved.expectedCategory) {
      await this.people.markDocumentReceived(approved.personId, approved.expectedCategory)
    }
    return approved
  }

  resetDemo(): Promise<DocumentRecord[]> {
    return this.repository.reset()
  }
}

export const documentService = new DocumentService(
  new MockDocumentRepository(),
  new MockAIService(),
)
