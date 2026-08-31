import { AlertTriangle, ArrowRight, CheckCircle2, FileCheck2, FileStack, LoaderCircle, MessageCircleMore, Upload, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { useDocuments } from '../../hooks/useDocuments'
import { usePeople } from '../../hooks/usePeople'
import { useConversations } from '../../hooks/useConversations'
import type { DocumentStatus } from '../../types/document'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function DashboardPage() {
  const { documents, loading: documentsLoading, error: documentsError, reload: reloadDocuments } = useDocuments()
  const { people, loading: peopleLoading, error: peopleError, reload: reloadPeople } = usePeople()
  const { conversations, loading: conversationsLoading, error: conversationsError, reload: reloadConversations } = useConversations()
  const loading = documentsLoading || peopleLoading || conversationsLoading
  const error = documentsError || peopleError || conversationsError
  const count = (statuses: DocumentStatus[]) => documents.filter((document) => statuses.includes(document.status)).length
  const reviewCount = count(['review_required'])
  const failedCount = count(['failed', 'rejected'])
  const conversationAttention = conversations.filter((item) => ['awaiting_internal_review', 'awaiting_document_review'].includes(item.status)).length
  const activeConversations = conversations.filter((item) => ['new_contact', 'collecting_data'].includes(item.status)).length
  const peopleAttention = people.filter((person) => person.documentStatus !== 'complete').length
  const cards = [
    { label: 'Documentos', value: documents.length, icon: FileStack, tone: 'blue' },
    { label: 'Em conferência', value: reviewCount, icon: FileCheck2, tone: 'amber' },
    { label: 'Atendimentos ativos', value: activeConversations, icon: MessageCircleMore, tone: 'cyan' },
    { label: 'Pessoas com atenção', value: peopleAttention, icon: UsersRound, tone: 'red' },
    { label: 'Aprovados', value: count(['approved']), icon: CheckCircle2, tone: 'green' },
  ]

  const reloadAll = () => { reloadDocuments(); reloadPeople(); void reloadConversations() }

  return (
    <div className="page">
      <div className="page-heading">
        <div><p className="eyebrow">Central operacional</p><h1>Dashboard</h1><p>Veja o que exige ação agora, do primeiro contato à documentação concluída.</p></div>
        <Link className="primary-button" to="/upload"><Upload size={18} aria-hidden="true" />Enviar documentos</Link>
      </div>

      {error ? <div className="feedback feedback--error" role="alert"><span>{error}</span><button type="button" onClick={reloadAll}>Tentar novamente</button></div> : null}

      <section className="summary-grid" aria-label="Resumo dos documentos">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className="summary-card" key={label}>
            <span className={`summary-icon summary-icon--${tone}`}><Icon size={21} aria-hidden="true" /></span>
            <div><span>{label}</span><strong>{loading ? '—' : value}</strong></div>
          </article>
        ))}
      </section>

      <section className="operations-grid" aria-label="Prioridades operacionais">
        <Link className="operation-card operation-card--review" to="/review"><span><FileCheck2 size={20} /></span><div><strong>{loading ? '—' : reviewCount} documentos para conferir</strong><p>Aprovar os dados ou solicitar um novo envio.</p></div><ArrowRight size={17} /></Link>
        <Link className="operation-card operation-card--whatsapp" to="/whatsapp"><span><MessageCircleMore size={20} /></span><div><strong>{loading ? '—' : conversationAttention} atendimentos aguardando equipe</strong><p>Validar pré-cadastros e acompanhar reenvios.</p></div><ArrowRight size={17} /></Link>
        <Link className="operation-card operation-card--people" to="/people"><span><UsersRound size={20} /></span><div><strong>{loading ? '—' : peopleAttention} pessoas precisam de atenção</strong><p>Consultar documentos pendentes ou desatualizados.</p></div><ArrowRight size={17} /></Link>
        {failedCount > 0 && <Link className="operation-card operation-card--failure" to="/documents"><span><AlertTriangle size={20} /></span><div><strong>{failedCount} documentos com falha ou recusa</strong><p>Consultar o histórico antes de um novo processamento.</p></div><ArrowRight size={17} /></Link>}
      </section>

      <section className="panel recent-panel">
        <div className="panel-heading"><div><h2>Documentos recentes</h2><p>Últimos arquivos adicionados ao sistema.</p></div><Link to="/documents">Ver todos <ArrowRight size={16} aria-hidden="true" /></Link></div>
        {loading ? <div className="state-message"><LoaderCircle className="spin" size={24} /><span>Carregando documentos...</span></div> : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Documento</th><th>Tipo detectado</th><th>Status</th><th>Confiança</th><th>Data</th></tr></thead>
              <tbody>{documents.slice(0, 5).map((document) => (
                <tr key={document.id}>
                  <td><span className="document-name">{document.originalFileName}</span><small>{formatBytes(document.sizeInBytes)}</small></td>
                  <td>{document.documentType}</td>
                  <td><DocumentStatusBadge status={document.status} /></td>
                  <td>{document.confidence === null ? '—' : `${Math.round(document.confidence * 100)}%`}</td>
                  <td>{dateFormatter.format(new Date(document.createdAt))}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
      <p className="demo-note">Ambiente demonstrativo · prioridades calculadas a partir dos dados fictícios desta sessão.</p>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}
