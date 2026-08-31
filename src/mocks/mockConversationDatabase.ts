import type { IntakeConversation } from '../types/conversation'
import { mockConversations } from './mockConversations'

const STORAGE_KEY = 'doc-intelligence:whatsapp-intakes:v1'

export class MockConversationDatabase {
  read(): IntakeConversation[] {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid conversation database')
      return parsed as IntakeConversation[]
    } catch {
      return this.reset()
    }
  }

  write(conversations: IntakeConversation[]): IntakeConversation[] {
    const snapshot = structuredClone(conversations)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return snapshot
  }

  reset(): IntakeConversation[] {
    return this.write(mockConversations)
  }
}

export const mockConversationDatabase = new MockConversationDatabase()
