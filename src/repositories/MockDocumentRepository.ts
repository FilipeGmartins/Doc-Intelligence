import type { DocumentRepository } from './DocumentRepository'
import type { DocumentListFilters, DocumentRecord } from '../types/document'
import { MockDatabase, mockDatabase } from '../mocks/mockDatabase'

const sessionPreviewUrls = new Map<string, string>()

function withSessionPreview(document: DocumentRecord): DocumentRecord {
  return { ...document, previewUrl: sessionPreviewUrls.get(document.id) }
}

export class MockDocumentRepository implements DocumentRepository {
  private readonly database: MockDatabase

  constructor(database: MockDatabase = mockDatabase) {
    this.database = database
  }

  async createMany(documents: DocumentRecord[]): Promise<DocumentRecord[]> {
    documents.forEach((document) => {
      if (document.previewUrl) sessionPreviewUrls.set(document.id, document.previewUrl)
    })
    const current = this.database.read()
    this.database.write([...documents, ...current])
    return structuredClone(documents)
  }

  async findAll(filters: DocumentListFilters = {}): Promise<DocumentRecord[]> {
    const query = filters.query?.trim().toLocaleLowerCase('pt-BR')
    return this.database.read().map(withSessionPreview).filter((document) => {
      if (filters.status && document.status !== filters.status) return false
      if (!query) return true

      return [document.originalFileName, document.suggestedFileName, document.documentType, document.status]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
    })
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    const document = this.database.read().find((item) => item.id === id)
    return document ? withSessionPreview(document) : null
  }

  async update(id: string, changes: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const documents = this.database.read()
    const index = documents.findIndex((document) => document.id === id)
    if (index < 0) throw new Error('DOCUMENT_NOT_FOUND')

    if (changes.previewUrl) sessionPreviewUrls.set(id, changes.previewUrl)
    const updated = { ...documents[index], ...structuredClone(changes), previewUrl: undefined, id }
    documents[index] = updated
    this.database.write(documents)
    return structuredClone(withSessionPreview(updated))
  }

  async reset(): Promise<DocumentRecord[]> {
    sessionPreviewUrls.clear()
    return this.database.reset()
  }
}
