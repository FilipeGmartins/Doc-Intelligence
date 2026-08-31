import { AlertTriangle, ArrowLeft, Check, FileText, History, Save, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { documentService } from '../../services/documentService'
import { personService } from '../../services/personService'
import { documentWorkflowService } from '../../services/documentWorkflowService'
import { DOCUMENT_CATEGORY_OPTIONS, type DocumentCategory, type DocumentRecord, type ExtractedField } from '../../types/document'
import type { PersonRecord } from '../../types/person'

const eventDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function DocumentDetailsPage() {
  const { id = '' } = useParams()
  const [document, setDocument] = useState<DocumentRecord | null>(null)
  const [fields, setFields] = useState<ExtractedField[]>([])
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [personId, setPersonId] = useState('')
  const [category, setCategory] = useState<DocumentCategory>('other')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageTone, setMessageTone] = useState<'success' | 'warning'>('success')
  const [showRejection, setShowRejection] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void Promise.all([documentService.getById(id), personService.list()]).then(([result, personList]) => { if (active) { setDocument(result); setFields(result.extractedFields); setPeople(personList); setPersonId(result.personId ?? ''); setCategory(result.expectedCategory ?? 'other'); setLoading(false) } }, () => { if (active) { setError('Documento não encontrado.'); setLoading(false) } })
    return () => { active = false }
  }, [id])

  const dirty = Boolean(document && (personId !== (document.personId ?? '') || category !== (document.expectedCategory ?? 'other') || fields.some((field) => field.value !== document.extractedFields.find(({ id: fieldId }) => fieldId === field.id)?.value)))
  const linkedPerson = people.find((person) => person.id === personId)
  const categoryLabel = DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? 'Documento'
  const finalized = ['approved', 'rejected'].includes(document?.status ?? '')

  const save = async () => {
    if (!document) return
    setSaving(true); setMessage(null); setMessageTone('success')
    const updated = await documentService.update(document.id, { extractedFields: fields, personId, expectedCategory: category })
    setDocument(updated); setFields(updated.extractedFields); setSaving(false); setMessage('Alterações salvas com sucesso. O documento continua aguardando aprovação.')
  }

  const approve = async () => {
    if (!document || dirty) return
    setSaving(true); setMessage(null); setMessageTone('success')
    const updated = await documentWorkflowService.approve(document.id)
    setDocument(updated)
    const refreshedPeople = await personService.list()
    setPeople(refreshedPeople)
    const refreshedPerson = refreshedPeople.find((person) => person.id === updated.personId)
    setMessage(refreshedPerson ? `${categoryLabel} aprovado e marcado como recebido para ${refreshedPerson.name}.` : 'Documento aprovado com sucesso.')
    setSaving(false)
  }

  const reject = async () => {
    if (!document || dirty || !rejectionReason.trim()) return
    setSaving(true); setMessage(null); setMessageTone('warning')
    const updated = await documentWorkflowService.reject(document.id, rejectionReason)
    setDocument(updated)
    setShowRejection(false)
    setMessage(`${categoryLabel} recusado. O atendimento do WhatsApp recebeu uma solicitação de reenvio.`)
    setSaving(false)
  }

  if (loading) return <div className="page"><div className="state-message">Carregando documento...</div></div>
  if (error || !document) return <div className="page"><div className="empty-state"><AlertTriangle size={34} /><h1>{error}</h1><Link to="/review">Voltar para a conferência</Link></div></div>

  return (
    <div className="page details-page">
      <Link className="back-link" to="/review"><ArrowLeft size={17} />Voltar para a fila</Link>
      <div className="details-heading"><div><p className="eyebrow">Conferência do documento</p><h1>{document.originalFileName}</h1><p>Revise as informações provisórias antes da aprovação.</p></div><DocumentStatusBadge status={document.status} /></div>
      {message && <div className={messageTone === 'success' ? 'success-message' : 'rejection-message'} role="status">{messageTone === 'success' ? <Check size={18} /> : <XCircle size={18} />}<span>{message}</span></div>}
      <div className="details-grid">
        <section className="document-preview"><div className="preview-heading"><span>Documento original</span><small>{document.previewUrl ? 'Disponível nesta sessão' : document.mimeType}</small></div>{document.previewUrl ? document.mimeType === 'application/pdf' ? <iframe title={`Preview de ${document.originalFileName}`} src={document.previewUrl} /> : <img src={document.previewUrl} alt={`Preview de ${document.originalFileName}`} /> : <div className="preview-placeholder"><FileText size={54} /><strong>Preview indisponível após recarregar</strong><p>Os dados e o histórico foram preservados. Como esta é uma demonstração local, o arquivo binário permanece somente na sessão em que foi enviado.</p></div>}</section>
        <section className="extracted-form"><div className="form-heading"><div><span>Dados extraídos</span><small>{document.documentType}</small></div><strong>{Math.round((document.confidence ?? 0) * 100)}% de confiança</strong></div>
          {document.status === 'approved' && <div className="finalized-banner"><Check size={17} />Documento finalizado. Os dados abaixo foram aprovados.</div>}
          {document.status === 'rejected' && <div className="rejected-banner"><XCircle size={17} /><span><strong>Documento recusado</strong>{document.rejectionReason}</span></div>}
          <div className="review-linkage"><label><span>Cliente vinculado</span><select disabled={finalized} value={personId} onChange={(event) => setPersonId(event.target.value)}><option value="">Sem vínculo</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label><span>Categoria documental</span><select disabled={finalized} value={category} onChange={(event) => setCategory(event.target.value as DocumentCategory)}>{DOCUMENT_CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div>
          {linkedPerson && <div className={`automation-impact ${finalized ? 'automation-impact--done' : ''}`}>{document.status === 'rejected' ? <XCircle size={17} /> : <Check size={17} />}<span><strong>{document.status === 'approved' ? 'Cadastro atualizado automaticamente' : document.status === 'rejected' ? 'Reenvio solicitado automaticamente' : 'Automação após a decisão'}</strong>{document.status === 'approved' ? `${categoryLabel} foi marcado como recebido para ${linkedPerson.name}.` : document.status === 'rejected' ? `O WhatsApp solicitou um novo ${categoryLabel.toLocaleLowerCase('pt-BR')} para ${linkedPerson.name}.` : `A aprovação marcará o documento como recebido; a recusa solicitará um novo envio.`}</span></div>}
          {!finalized && <div className="provisional-banner"><AlertTriangle size={17} /><span><strong>Dados provisórios</strong>Confira todos os campos antes de finalizar.</span></div>}
          <div className="field-list">{fields.map((field) => <label className={`extracted-field ${field.confidence < .8 ? 'extracted-field--warning' : ''}`} key={field.id}><span><strong>{field.label}</strong><small>Confiança: {Math.round(field.confidence * 100)}% {field.confidence < .8 ? '· Revisar' : ''}</small></span><input disabled={finalized} value={field.value} onChange={(event) => setFields((current) => current.map((item) => item.id === field.id ? { ...item, value: event.target.value } : item))} />{(field.manuallyEdited || field.value !== document.extractedFields.find(({ id }) => id === field.id)?.value) && <em>Corrigido manualmente</em>}</label>)}</div>
          {showRejection && !finalized && <div className="rejection-form"><label><span>Motivo da recusa</span><textarea autoFocus value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} placeholder="Ex.: imagem cortada ou dados ilegíveis" /></label><div><button className="secondary-button" type="button" onClick={() => setShowRejection(false)}>Cancelar</button><button className="danger-button" type="button" disabled={!rejectionReason.trim() || saving} onClick={() => void reject()}><XCircle size={16} />Confirmar e solicitar reenvio</button></div></div>}
          {!finalized && <div className="form-actions"><button className="secondary-button action-save" type="button" disabled={!dirty || saving} onClick={() => void save()}><Save size={17} />{saving ? 'Salvando...' : 'Salvar alterações'}</button><button className="reject-button" type="button" disabled={dirty || saving} onClick={() => setShowRejection(true)}><XCircle size={17} />Recusar e solicitar novo</button><button className="primary-button primary-button--button" type="button" disabled={dirty || saving} title={dirty ? 'Salve as alterações antes de decidir' : undefined} onClick={() => void approve()}><Check size={18} />Aprovar documento</button></div>}
        </section>
      </div>
      <section className="panel audit-panel">
        <div className="panel-heading"><div><h2>Histórico do documento</h2><p>Registro demonstrativo das principais ações e decisões.</p></div><History size={20} aria-hidden="true" /></div>
        {document.events.length ? <ol className="audit-timeline">{[...document.events].reverse().map((event) => <li key={event.id}><span className={`audit-dot audit-dot--${event.type}`} /><div><strong>{event.description}</strong><small>{event.actor} · {eventDateFormatter.format(new Date(event.createdAt))}</small></div></li>)}</ol> : <div className="state-message audit-empty">Nenhum evento registrado para este documento legado.</div>}
      </section>
    </div>
  )
}
