import { MockConversationDatabase, mockConversationDatabase } from '../mocks/mockConversationDatabase'
import type { IntakeConversation } from '../types/conversation'
import type { ConversationRepository } from './ConversationRepository'

export class MockConversationRepository implements ConversationRepository {
  private readonly database: MockConversationDatabase

  constructor(database: MockConversationDatabase = mockConversationDatabase) {
    this.database = database
  }

  async findAll(): Promise<IntakeConversation[]> {
    return this.database.read().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }

  async findById(id: string): Promise<IntakeConversation | null> {
    return this.database.read().find((conversation) => conversation.id === id) ?? null
  }

  async update(id: string, changes: Partial<IntakeConversation>): Promise<IntakeConversation> {
    const conversations = this.database.read()
    const index = conversations.findIndex((conversation) => conversation.id === id)
    if (index < 0) throw new Error('CONVERSATION_NOT_FOUND')
    const updated = { ...conversations[index], ...structuredClone(changes), id }
    conversations[index] = updated
    this.database.write(conversations)
    return structuredClone(updated)
  }

  async reset(): Promise<IntakeConversation[]> {
    return this.database.reset()
  }
}
