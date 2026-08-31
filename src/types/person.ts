import type { DocumentCategory } from './document'

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
  documentRequirements?: DocumentCategory[]
  receivedDocuments?: DocumentCategory[]
  source?: 'manual' | 'whatsapp'
  sourceReference?: string
}

export interface UpdatePersonInput {
  name: string
  identifier: string
  email: string
  documentRequirements: DocumentCategory[]
  receivedDocuments: DocumentCategory[]
  updateReason?: string
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

export interface CreateManualPersonInput {
  name: string
  identifier: string
  email: string
  documentRequirements: DocumentCategory[]
}
