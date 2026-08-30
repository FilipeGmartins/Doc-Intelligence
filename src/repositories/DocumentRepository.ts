import type {
  DocumentListFilters,
  DocumentRecord,
} from '../types/document'

export interface DocumentRepository {
  createMany(documents: DocumentRecord[]): Promise<DocumentRecord[]>
  findAll(filters?: DocumentListFilters): Promise<DocumentRecord[]>
  findById(id: string): Promise<DocumentRecord | null>
  update(
    id: string,
    changes: Partial<DocumentRecord>,
  ): Promise<DocumentRecord>
  reset(): Promise<DocumentRecord[]>
}
