import { CircleAlert, CircleCheck, FileSearch, RefreshCw, Search, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { PersonStatusBadge } from '../../components/people/PersonStatusBadge'
import { usePeople } from '../../hooks/usePeople'
import type { PersonDocumentStatus } from '../../types/person'

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })

const filters: Array<{ label: string; value: '' | PersonDocumentStatus }> = [
  { label: 'Todas as situações', value: '' },
  { label: 'Documentação correta', value: 'complete' },
  { label: 'Documento pendente', value: 'pending_document' },
  { label: 'Atualização necessária', value: 'update_required' },
]

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

export function PeoplePage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | PersonDocumentStatus>('')
  const { people, loading, error, reload } = usePeople({ query, status: status || undefined })
  const { people: allPeople, loading: summaryLoading } = usePeople()
  const count = (target: PersonDocumentStatus) => allPeople.filter((person) => person.documentStatus === target).length

  return (
    <div className="page people-page">
      <div className="page-heading people-heading">
        <div><p className="eyebrow">Cadastro e conformidade</p><h1>Pessoas</h1><p>Veja rapidamente quem está com a documentação completa e quem precisa de atenção.</p></div>
        <div className="people-total"><span><UsersRound size={18} aria-hidden="true" /></span><div><strong>{loading ? '—' : people.length}</strong><small>pessoas exibidas</small></div></div>
      </div>

      <section className="people-summary" aria-label="Resumo da situação documental">
        <article><span className="people-summary-icon people-summary-icon--complete"><CircleCheck size={20} aria-hidden="true" /></span><div><strong>{summaryLoading ? '—' : count('complete')}</strong><small>Documentação correta</small></div></article>
        <article><span className="people-summary-icon people-summary-icon--pending"><CircleAlert size={20} aria-hidden="true" /></span><div><strong>{summaryLoading ? '—' : count('pending_document')}</strong><small>Com documento pendente</small></div></article>
        <article><span className="people-summary-icon people-summary-icon--update"><RefreshCw size={20} aria-hidden="true" /></span><div><strong>{summaryLoading ? '—' : count('update_required')}</strong><small>Precisam atualizar</small></div></article>
      </section>

      <section className="panel people-panel">
        <div className="documents-toolbar">
          <label className="search-field documents-search"><Search size={17} aria-hidden="true" /><span className="sr-only">Buscar pessoas</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, CPF ou e-mail..." /></label>
          <label className="status-filter"><span className="sr-only">Filtrar situação documental</span><select value={status} onChange={(event) => setStatus(event.target.value as '' | PersonDocumentStatus)}>{filters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}</select></label>
          <span className="documents-count">{loading ? 'Carregando…' : `${people.length} ${people.length === 1 ? 'pessoa' : 'pessoas'}`}</span>
        </div>

        {error ? <div className="state-message state-message--error"><span>{error}</span><button type="button" onClick={reload}>Tentar novamente</button></div> : loading ? <div className="state-message">Carregando cadastros...</div> : people.length === 0 ? <div className="empty-state"><FileSearch size={36} /><h2>Nenhuma pessoa encontrada</h2><p>Ajuste a busca ou a situação documental.</p></div> : (
          <div className="people-list">{people.map((person) => (
            <article className="person-row" key={person.id}>
              <span className="person-avatar" aria-hidden="true">{getInitials(person.name)}</span>
              <div className="person-identity"><strong>{person.name}{person.source === 'whatsapp' ? <em className="source-label">WhatsApp</em> : null}</strong><span>{person.identifier}</span><small>{person.email}</small></div>
              <div className="person-documents"><strong>{person.documentCount} documentos</strong><span>{person.documentStatus === 'pending_document' ? `Faltam: ${person.missingDocuments.join(', ')}` : person.updateReason ?? 'Cadastro conferido e atualizado'}</span></div>
              <div className="person-state"><PersonStatusBadge status={person.documentStatus} /><small>Atualizado em {dateFormatter.format(new Date(person.updatedAt))}</small></div>
            </article>
          ))}</div>
        )}
      </section>
      <p className="demo-note">Cadastros demonstrativos · nomes, CPFs e contatos são fictícios.</p>
    </div>
  )
}
