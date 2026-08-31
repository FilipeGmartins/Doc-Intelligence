import type { DocumentRecord } from '../types/document'
import { ConversationService, conversationService } from './conversationService'
import { DocumentService, documentService } from './documentService'

export class DocumentWorkflowService {
  private readonly documents: DocumentService
  private readonly conversations: ConversationService

  constructor(
    documents: DocumentService = documentService,
    conversations: ConversationService = conversationService,
  ) {
    this.documents = documents
    this.conversations = conversations
  }

  async approve(id: string): Promise<DocumentRecord> {
    const document = await this.documents.approve(id)
    await this.conversations.registerDocumentOutcome(document, 'approved')
    return document
  }

  async reject(id: string, reason: string): Promise<DocumentRecord> {
    const document = await this.documents.reject(id, reason)
    await this.conversations.registerDocumentOutcome(document, 'rejected')
    return document
  }
}

export const documentWorkflowService = new DocumentWorkflowService()
