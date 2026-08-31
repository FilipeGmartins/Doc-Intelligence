export type PersonDocumentStatus = 'complete' | 'pending_document' | 'update_required'

export interface PersonRecord {
  id: string
  name: string
  identifier: string
  email: string
  documentStatus: PersonDocumentStatus
  documentCount: number
  missingDocuments: string[]
  updateReason?: string
  updatedAt: string
}

export interface PersonListFilters {
  query?: string
  status?: PersonDocumentStatus
}
