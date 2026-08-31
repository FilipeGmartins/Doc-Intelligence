import { CircleAlert, CircleCheck, RefreshCw } from 'lucide-react'
import type { PersonDocumentStatus } from '../../types/person'

const statusConfig = {
  complete: { label: 'Documentação correta', icon: CircleCheck },
  pending_document: { label: 'Documento pendente', icon: CircleAlert },
  update_required: { label: 'Atualização necessária', icon: RefreshCw },
} satisfies Record<PersonDocumentStatus, { label: string; icon: typeof CircleCheck }>

export function PersonStatusBadge({ status }: { status: PersonDocumentStatus }) {
  const { label, icon: Icon } = statusConfig[status]
  return <span className={`person-status person-status--${status}`}><Icon size={14} aria-hidden="true" />{label}</span>
}
