import { ArrowRight, FileSearch, Search, Upload } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { useDocuments } from '../../hooks/useDocuments'
import type { DocumentStatus } from '../../types/document'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const statusOptions: Array<{ label: string; value: '' | DocumentStatus }> = [
  { label: 'Todos os status', value: '' },
  { label: 'Pendente', value: 'pending' },
  { label: 'Processando', value: 'processing' },
  { label: 'Processado', value: 'processed' },
  { label: 'Revisão necessária', value: 'review_required' },
  { label: 'Falha', value: 'failed' },
  { label: 'Aprovado', value: 'approved' },
]

export function DocumentsPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | DocumentStatus>('')
  const { documents, loading, error, reload } = useDocuments({
    query,
    status: status || undefined,
  })

  const hasFilters = Boolean(query.trim() || status)

  return (
    <div className="page documents-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Acervo</p>
          <h1>Documentos</h1>
          <p>Consulte arquivos recebidos e acompanhe o estado de cada processamento.</p>
        </div>
        <Link className="primary-button" to="/upload"><Upload size={18} aria-hidden="true" />Enviar documentos</Link>
      </div>

      <section className="panel documents-panel">
        <div className="documents-toolbar">
          <label className="search-field documents-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Buscar documentos</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome ou tipo..."
            />
          </label>
          <label className="status-filter">
            <span className="sr-only">Filtrar por status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as '' | DocumentStatus)}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <span className="documents-count">{loading ? 'Carregando…' : `${documents.length} ${documents.length === 1 ? 'documento' : 'documentos'}`}</span>
        </div>

        {error ? (
          <div className="state-message state-message--error">
            <span>{error}</span>
            <button type="button" onClick={() => void reload()}>Tentar novamente</button>
          </div>
        ) : loading ? (
          <div className="state-message">Carregando documentos...</div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <FileSearch size={36} aria-hidden="true" />
            <h2>{hasFilters ? 'Nenhum documento encontrado' : 'Nenhum documento enviado'}</h2>
            <p>{hasFilters ? 'Ajuste a busca ou o filtro de status.' : 'Envie o primeiro arquivo para começar.'}</p>
            {hasFilters ? <button className="text-button clear-filters" type="button" onClick={() => { setQuery(''); setStatus('') }}>Limpar filtros</button> : null}
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead><tr><th>Documento</th><th>Tipo detectado</th><th>Status</th><th>Confiança</th><th>Recebido em</th><th><span className="sr-only">Ações</span></th></tr></thead>
              <tbody>{documents.map((document) => (
                <tr key={document.id}>
                  <td><span className="document-name">{document.originalFileName}</span><small>{document.suggestedFileName || 'Nome sugerido indisponível'}</small></td>
                  <td>{document.documentType}</td>
                  <td><DocumentStatusBadge status={document.status} /></td>
                  <td>{document.confidence === null ? '—' : `${Math.round(document.confidence * 100)}%`}</td>
                  <td>{dateFormatter.format(new Date(document.createdAt))}</td>
                  <td><Link className="document-open-link" to={`/documents/${document.id}`} aria-label={`Abrir ${document.originalFileName}`}>Abrir <ArrowRight size={15} aria-hidden="true" /></Link></td>
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
