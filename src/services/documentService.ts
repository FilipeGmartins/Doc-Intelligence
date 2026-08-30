import { MockDocumentRepository } from '../repositories/MockDocumentRepository'
import type { DocumentRepository } from '../repositories/DocumentRepository'
import type {
  DocumentListFilters,
  DocumentRecord,
  ExtractedField,
  UpdateDocumentInput,
} from '../types/document'
import { getStatusFromConfidence } from '../utils/confidence'
import { MockAIService } from './mockAIService'

export interface DocumentServiceContract {
  upload(files: File[]): Promise<DocumentRecord[]>
  list(filters?: DocumentListFilters): Promise<DocumentRecord[]>
  getById(id: string): Promise<DocumentRecord>
  update(id: string, changes: UpdateDocumentInput): Promise<DocumentRecord>
  process(id: string): Promise<DocumentRecord>
  reprocess(id: string): Promise<DocumentRecord>
  approve(id: string): Promise<DocumentRecord>
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `doc-${Date.now()}`
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
  private readonly aiService: MockAIService

  constructor(
    repository: DocumentRepository,
    aiService: MockAIService,
  ) {
    this.repository = repository
    this.aiService = aiService
  }

  async upload(files: File[]): Promise<DocumentRecord[]> {
    const now = new Date().toISOString()
    const documents = files.map<DocumentRecord>((file) => ({
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
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))

    return this.repository.createMany(documents)
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

    return this.repository.update(id, {
      ...changes,
      ...(extractedFields ? { extractedFields } : {}),
      updatedAt: new Date().toISOString(),
    })
  }

  async process(id: string): Promise<DocumentRecord> {
    const current = await this.getById(id)
    await this.repository.update(id, {
      status: 'processing',
      processingError: undefined,
      updatedAt: new Date().toISOString(),
    })

    try {
      const result = await this.aiService.process(current.originalFileName)
      return this.repository.update(id, {
        ...result,
        status: getStatusFromConfidence(result.confidence),
        processingError: undefined,
        updatedAt: new Date().toISOString(),
      })
    } catch {
      return this.repository.update(id, {
        status: 'failed',
        confidence: null,
        processingError: 'Não foi possível processar este documento.',
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
    return this.repository.update(id, {
      status: 'approved',
      approvedAt: now,
      updatedAt: now,
    })
  }
}

export const documentService = new DocumentService(
  new MockDocumentRepository(),
  new MockAIService(),
)
