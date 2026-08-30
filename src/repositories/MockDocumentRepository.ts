import type { DocumentRepository } from './DocumentRepository'
import type { DocumentListFilters, DocumentRecord } from '../types/document'
import { MockDatabase, mockDatabase } from '../mocks/mockDatabase'

export class MockDocumentRepository implements DocumentRepository {
  private readonly database: MockDatabase

  constructor(database: MockDatabase = mockDatabase) {
    this.database = database
  }

  async createMany(documents: DocumentRecord[]): Promise<DocumentRecord[]> {
    const current = this.database.read()
    this.database.write([...documents, ...current])
    return structuredClone(documents)
  }

  async findAll(filters: DocumentListFilters = {}): Promise<DocumentRecord[]> {
    const query = filters.query?.trim().toLocaleLowerCase('pt-BR')
    return this.database.read().filter((document) => {
      if (filters.status && document.status !== filters.status) return false
      if (!query) return true

      return [document.originalFileName, document.suggestedFileName, document.documentType, document.status]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
    })
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    return this.database.read().find((document) => document.id === id) ?? null
  }

  async update(id: string, changes: Partial<DocumentRecord>): Promise<DocumentRecord> {
    const documents = this.database.read()
    const index = documents.findIndex((document) => document.id === id)
    if (index < 0) throw new Error('DOCUMENT_NOT_FOUND')

    const updated = { ...documents[index], ...structuredClone(changes), id }
    documents[index] = updated
    this.database.write(documents)
    return structuredClone(updated)
  }

  async reset(): Promise<DocumentRecord[]> {
    return this.database.reset()
  }
}
