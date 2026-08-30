import { AlertTriangle, ArrowRight, CheckCircle2, FileStack, LoaderCircle, Upload } from 'lucide-react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { useDocuments } from '../../hooks/useDocuments'
import type { DocumentStatus } from '../../types/document'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function DashboardPage() {
  const { documents, loading, error, reload } = useDocuments()
  const count = (statuses: DocumentStatus[]) => documents.filter((document) => statuses.includes(document.status)).length
  const cards = [
    { label: 'Total', value: documents.length, icon: FileStack, tone: 'blue' },
    { label: 'Processando', value: count(['pending', 'processing']), icon: LoaderCircle, tone: 'cyan' },
    { label: 'Processados', value: count(['processed', 'approved']), icon: CheckCircle2, tone: 'green' },
    { label: 'Revisão necessária', value: count(['review_required']), icon: AlertTriangle, tone: 'amber' },
    { label: 'Falhas', value: count(['failed']), icon: AlertTriangle, tone: 'red' },
  ]

  return (
    <div className="page">
      <div className="page-heading">
        <div><p className="eyebrow">Visão geral</p><h1>Dashboard</h1><p>Acompanhe o processamento e a conferência dos documentos.</p></div>
        <Link className="primary-button" to="/upload"><Upload size={18} aria-hidden="true" />Enviar documentos</Link>
      </div>

      {error ? <div className="feedback feedback--error" role="alert"><span>{error}</span><button type="button" onClick={() => void reload()}>Tentar novamente</button></div> : null}

      <section className="summary-grid" aria-label="Resumo dos documentos">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <article className="summary-card" key={label}>
            <span className={`summary-icon summary-icon--${tone}`}><Icon size={21} aria-hidden="true" /></span>
            <div><span>{label}</span><strong>{loading ? '—' : value}</strong></div>
          </article>
        ))}
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
      <p className="demo-note">Ambiente demonstrativo · todos os dados apresentados são fictícios.</p>
    </div>
  )
}

function formatBytes(bytes: number) {
  if (bytes < 1_000_000) return `${Math.round(bytes / 1_000)} KB`
  return `${(bytes / 1_000_000).toFixed(1)} MB`
}
