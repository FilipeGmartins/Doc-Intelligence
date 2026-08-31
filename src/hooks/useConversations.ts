import { useCallback, useEffect, useState } from 'react'
import { conversationService } from '../services/conversationService'
import type { IntakeConversation } from '../types/conversation'

export function useConversations() {
  const [conversations, setConversations] = useState<IntakeConversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      setConversations(await conversationService.list())
      setError(null)
    } catch {
      setError('Não foi possível carregar os atendimentos simulados.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void conversationService.list().then(
      (result) => {
        if (!active) return
        setConversations(result)
        setError(null)
        setLoading(false)
      },
      () => {
        if (!active) return
        setError('Não foi possível carregar os atendimentos simulados.')
        setLoading(false)
      },
    )
    return () => { active = false }
  }, [])

  const mutate = async (operation: () => Promise<IntakeConversation>) => {
    const updated = await operation()
    await reload()
    return updated
  }

  return {
    conversations,
    loading,
    error,
    reload,
    reply: (id: string, value: string) => mutate(() => conversationService.reply(id, value)),
    attachMockDocument: (id: string) => mutate(() => conversationService.attachMockDocument(id)),
    approve: (id: string) => mutate(() => conversationService.approve(id)),
    resetDemo: async () => {
      await conversationService.resetDemo()
      await reload()
    },
  }
}
