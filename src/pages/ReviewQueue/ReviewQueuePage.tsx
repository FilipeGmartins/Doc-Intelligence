import { ArrowRight, FileSearch, Search } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { useDocuments } from '../../hooks/useDocuments'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' })

export function ReviewQueuePage() {
  const [query, setQuery] = useState('')
  const { documents, loading, error, reload } = useDocuments({ status: 'review_required', query })

  return (
    <div className="page review-page">
      <div className="page-heading"><div><p className="eyebrow">Validação humana</p><h1>Fila de conferência</h1><p>Revise dados provisórios antes de finalizar os documentos.</p></div></div>
      <div className="review-explainer"><span>1</span><div><strong>Dados aguardando conferência</strong><p>Salvar mantém o documento em revisão. Somente “Aprovar documento” conclui o cadastro.</p></div></div>
      <section className="panel queue-panel">
        <div className="queue-toolbar"><label className="search-field"><Search size={17} /><span className="sr-only">Buscar documentos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome ou tipo..." /></label><span>{documents.length} em revisão</span></div>
        {error ? <div className="state-message state-message--error"><span>{error}</span><button type="button" onClick={reload}>Tentar novamente</button></div> : loading ? <div className="state-message">Carregando fila...</div> : documents.length === 0 ? <div className="empty-state"><FileSearch size={34} /><h2>Nenhum documento aguardando conferência</h2><p>{query ? 'Tente buscar por outro termo.' : 'Novos documentos de baixa confiança aparecerão aqui.'}</p></div> : <div className="review-list">{documents.map((document) => <article className="review-item" key={document.id}><div className="confidence-ring"><strong>{Math.round((document.confidence ?? 0) * 100)}%</strong><small>confiança</small></div><div className="review-document"><strong>{document.originalFileName}</strong><span>{document.documentType}</span><small>Recebido em {dateFormatter.format(new Date(document.createdAt))}</small></div><DocumentStatusBadge status={document.status} /><Link className="review-link" to={`/documents/${document.id}`}>Revisar <ArrowRight size={16} /></Link></article>)}</div>}
      </section>
    </div>
  )
}
