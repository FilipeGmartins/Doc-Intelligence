import { CircleAlert, CircleCheck, FileSearch, Pencil, RefreshCw, Save, Search, UsersRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { PersonStatusBadge } from '../../components/people/PersonStatusBadge'
import { usePeople } from '../../hooks/usePeople'
import { DOCUMENT_CATEGORY_OPTIONS, type DocumentCategory } from '../../types/document'
import type { PersonDocumentStatus, PersonRecord, UpdatePersonInput } from '../../types/person'

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

function createEditForm(person: PersonRecord): UpdatePersonInput {
  return {
    name: person.name,
    identifier: person.identifier,
    email: person.email,
    documentRequirements: person.documentRequirements ?? [],
    receivedDocuments: person.receivedDocuments ?? [],
    updateReason: person.updateReason ?? '',
  }
}

function toggleCategory(categories: DocumentCategory[], category: DocumentCategory) {
  return categories.includes(category) ? categories.filter((item) => item !== category) : [...categories, category]
}

export function PeoplePage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'' | PersonDocumentStatus>('')
  const [editingPerson, setEditingPerson] = useState<PersonRecord | null>(null)
  const [editForm, setEditForm] = useState<UpdatePersonInput | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const { people, loading, error, reload, update } = usePeople({ query, status: status || undefined })
  const { people: allPeople, loading: summaryLoading, reload: reloadSummary } = usePeople()
  const count = (target: PersonDocumentStatus) => allPeople.filter((person) => person.documentStatus === target).length

  useEffect(() => {
    if (!editingPerson) return
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setEditingPerson(null) }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [editingPerson])

  function openEditor(person: PersonRecord) {
    setEditingPerson(person)
    setEditForm(createEditForm(person))
    setSaveError(null)
  }

  async function savePerson(event: React.FormEvent) {
    event.preventDefault()
    if (!editingPerson || !editForm) return
    setSaving(true)
    setSaveError(null)
    try {
      await update(editingPerson.id, editForm)
      setEditingPerson(null)
      reload()
      reloadSummary()
    } catch {
      setSaveError('Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

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
              <button className="person-edit-button" type="button" onClick={() => openEditor(person)} aria-label={`Editar cadastro de ${person.name}`}><Pencil size={16} aria-hidden="true" />Editar</button>
            </article>
          ))}</div>
        )}
      </section>
      <p className="demo-note">Cadastros demonstrativos · nomes, CPFs e contatos são fictícios.</p>

      {editingPerson && editForm && (
        <div className="person-editor-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingPerson(null) }}>
          <form className="person-editor" role="dialog" aria-modal="true" aria-labelledby="person-editor-title" onSubmit={savePerson}>
            <div className="person-editor-heading">
              <div><p className="eyebrow">Edição simulada</p><h2 id="person-editor-title">Editar pessoa</h2><p>Defina o que é exigido e marque o que já foi recebido.</p></div>
              <button type="button" className="icon-button" onClick={() => setEditingPerson(null)} aria-label="Fechar edição"><X size={19} /></button>
            </div>

            <div className="person-editor-fields">
              <label><span>Nome completo</span><input autoFocus required value={editForm.name} onChange={(event) => setEditForm({ ...editForm, name: event.target.value })} /></label>
              <label><span>CPF ou identificador</span><input required value={editForm.identifier} onChange={(event) => setEditForm({ ...editForm, identifier: event.target.value })} /></label>
              <label className="person-editor-field--wide"><span>E-mail</span><input type="email" required value={editForm.email} onChange={(event) => setEditForm({ ...editForm, email: event.target.value })} /></label>
            </div>

            <div className="person-document-editor">
              <div className="person-document-editor-heading"><div><h3>Controle de documentos</h3><p>“Exigido” define a pendência; “Recebido” simula o documento adicionado.</p></div><div className="document-matrix-legend"><span>Exigido</span><span>Recebido</span></div></div>
              <div className="document-matrix">
                {DOCUMENT_CATEGORY_OPTIONS.map((option) => (
                  <div className="document-matrix-row" key={option.value}>
                    <div><strong>{option.label}</strong><small>{option.description}</small></div>
                    <label className="matrix-checkbox"><span className="sr-only">Exigir {option.label}</span><input type="checkbox" checked={editForm.documentRequirements.includes(option.value)} onChange={() => setEditForm({ ...editForm, documentRequirements: toggleCategory(editForm.documentRequirements, option.value) })} /></label>
                    <label className="matrix-checkbox matrix-checkbox--received"><span className="sr-only">Marcar {option.label} como recebido</span><input type="checkbox" checked={editForm.receivedDocuments.includes(option.value)} onChange={() => setEditForm({ ...editForm, receivedDocuments: toggleCategory(editForm.receivedDocuments, option.value) })} /></label>
                  </div>
                ))}
              </div>
            </div>

            <label className="person-update-reason"><span>Motivo de atualização <small>(opcional)</small></span><input value={editForm.updateReason ?? ''} onChange={(event) => setEditForm({ ...editForm, updateReason: event.target.value })} placeholder="Ex.: documento vencido" /></label>
            {saveError && <p className="person-editor-error" role="alert">{saveError}</p>}
            <div className="person-editor-actions"><button type="button" className="secondary-button" onClick={() => setEditingPerson(null)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}><Save size={16} />{saving ? 'Salvando…' : 'Salvar alterações'}</button></div>
          </form>
        </div>
      )}
    </div>
  )
}
