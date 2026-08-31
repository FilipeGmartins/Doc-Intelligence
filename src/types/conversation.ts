import type { DocumentCategory } from './document'

export type ConversationStatus = 'new_contact' | 'collecting_data' | 'awaiting_internal_review' | 'awaiting_document_review' | 'approved'
export type IntakeStep = 'name' | 'identifier' | 'email' | 'address' | 'document' | 'complete'
export type MessageSender = 'bot' | 'customer' | 'system'

export interface ConversationMessage {
  id: string
  sender: MessageSender
  content: string
  createdAt: string
}

export interface IntakeDraft {
  name: string
  identifier: string
  email: string
  address: string
  documents: string[]
}

export interface IntakeConversation {
  id: string
  phone: string
  displayName: string
  status: ConversationStatus
  currentStep: IntakeStep
  completion: number
  draft: IntakeDraft
  messages: ConversationMessage[]
  createdAt: string
  updatedAt: string
  approvedPersonId?: string
  provisionalPersonId?: string
  documentIds?: string[]
  requestedCategory?: DocumentCategory
}
