import type { IntakeConversation } from '../types/conversation'
import { mockConversations } from './mockConversations'
import { isValidCpf, sanitizeCpf } from '../utils/personalIdentifiers'

const STORAGE_KEY = 'doc-intelligence:whatsapp-intakes:v2'
const LEGACY_STORAGE_KEY = 'doc-intelligence:whatsapp-intakes:v1'

function normalizeConversations(conversations: IntakeConversation[]): IntakeConversation[] {
  return conversations.map((conversation) => {
    if (!conversation.draft.identifier) return conversation
    const sanitized = sanitizeCpf(conversation.draft.identifier)
    if (isValidCpf(sanitized)) return { ...conversation, draft: { ...conversation.draft, identifier: sanitized } }
    const seeded = mockConversations.find((item) => item.id === conversation.id)?.draft.identifier ?? ''
    if (isValidCpf(seeded)) return { ...conversation, draft: { ...conversation.draft, identifier: seeded } }
    return {
      ...conversation,
      status: 'collecting_data',
      currentStep: 'identifier',
      completion: 20,
      draft: { ...conversation.draft, identifier: '' },
      messages: [...conversation.messages, {
        id: `message-identifier-migration-${conversation.id}`,
        sender: 'system',
        content: 'CPF anterior removido pela validação. Informe novamente 11 números válidos.',
        createdAt: conversation.updatedAt,
      }],
    }
  })
}

export class MockConversationDatabase {
  read(): IntakeConversation[] {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid conversation database')
      const normalized = normalizeConversations(parsed as IntakeConversation[])
      this.write(normalized)
      return normalized
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
