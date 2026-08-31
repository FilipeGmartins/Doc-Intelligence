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
  source?: 'manual' | 'whatsapp'
  sourceReference?: string
}

export interface PersonListFilters {
  query?: string
  status?: PersonDocumentStatus
}

export interface CreatePersonFromIntakeInput {
  sourceReference: string
  name: string
  identifier: string
  email: string
  documentCount: number
}
