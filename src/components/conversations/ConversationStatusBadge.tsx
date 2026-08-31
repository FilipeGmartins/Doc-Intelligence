import { BadgeCheck, Bot, Clock3, MessageCircleMore } from 'lucide-react'
import type { ConversationStatus } from '../../types/conversation'

const statusConfig = {
  new_contact: { label: 'Novo contato', icon: MessageCircleMore },
  collecting_data: { label: 'Coletando dados', icon: Bot },
  awaiting_internal_review: { label: 'Aguardando validação', icon: Clock3 },
  approved: { label: 'Cadastro criado', icon: BadgeCheck },
} satisfies Record<ConversationStatus, { label: string; icon: typeof Clock3 }>

export function ConversationStatusBadge({ status }: { status: ConversationStatus }) {
  const { label, icon: Icon } = statusConfig[status]
  return <span className={`intake-status intake-status--${status}`}><Icon size={13} aria-hidden="true" />{label}</span>
}
