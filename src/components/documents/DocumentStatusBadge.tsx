import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, ShieldCheck } from 'lucide-react'
import type { DocumentStatus } from '../../types/document'

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock3 },
  processing: { label: 'Processando', icon: LoaderCircle },
  processed: { label: 'Processado', icon: CheckCircle2 },
  review_required: { label: 'Revisão necessária', icon: AlertCircle },
  failed: { label: 'Falha', icon: AlertCircle },
  approved: { label: 'Aprovado', icon: ShieldCheck },
} satisfies Record<DocumentStatus, { label: string; icon: typeof Clock3 }>

export function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  const { label, icon: Icon } = statusConfig[status]
  return <span className={`status-badge status-badge--${status}`}><Icon size={14} aria-hidden="true" />{label}</span>
}
