import type { IntakeConversation } from '../types/conversation'

export interface ConversationRepository {
  findAll(): Promise<IntakeConversation[]>
  findById(id: string): Promise<IntakeConversation | null>
  update(id: string, changes: Partial<IntakeConversation>): Promise<IntakeConversation>
  reset(): Promise<IntakeConversation[]>
}
