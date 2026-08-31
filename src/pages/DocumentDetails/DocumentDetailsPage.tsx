import { AlertTriangle, ArrowLeft, Check, FileText, History, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { documentService } from '../../services/documentService'
import type { DocumentRecord, ExtractedField } from '../../types/document'

const eventDateFormatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export function DocumentDetailsPage() {
  const { id = '' } = useParams()
  const [document, setDocument] = useState<DocumentRecord | null>(null)
  const [fields, setFields] = useState<ExtractedField[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void documentService.getById(id).then((result) => { if (active) { setDocument(result); setFields(result.extractedFields); setLoading(false) } }, () => { if (active) { setError('Documento não encontrado.'); setLoading(false) } })
    return () => { active = false }
  }, [id])

  const dirty = Boolean(document && fields.some((field) => field.value !== document.extractedFields.find(({ id: fieldId }) => fieldId === field.id)?.value))

  const save = async () => {
    if (!document) return
    setSaving(true); setMessage(null)
    const updated = await documentService.update(document.id, { extractedFields: fields })
    setDocument(updated); setFields(updated.extractedFields); setSaving(false); setMessage('Alterações salvas com sucesso. O documento continua aguardando aprovação.')
  }

  const approve = async () => {
    if (!document || dirty) return
    const updated = await documentService.approve(document.id)
    setDocument(updated); setMessage('Documento aprovado e cadastro finalizado com sucesso.')
  }

  if (loading) return <div className="page"><div className="state-message">Carregando documento...</div></div>
  if (error || !document) return <div className="page"><div className="empty-state"><AlertTriangle size={34} /><h1>{error}</h1><Link to="/review">Voltar para a conferência</Link></div></div>

  return (
    <div className="page details-page">
      <Link className="back-link" to="/review"><ArrowLeft size={17} />Voltar para a fila</Link>
      <div className="details-heading"><div><p className="eyebrow">Conferência do documento</p><h1>{document.originalFileName}</h1><p>Revise as informações provisórias antes da aprovação.</p></div><DocumentStatusBadge status={document.status} /></div>
      {message && <div className="success-message" role="status"><Check size={18} /><span>{message}</span></div>}
      <div className="details-grid">
        <section className="document-preview"><div className="preview-heading"><span>Documento original</span><small>{document.mimeType}</small></div>{document.previewUrl ? document.mimeType === 'application/pdf' ? <iframe title={`Preview de ${document.originalFileName}`} src={document.previewUrl} /> : <img src={document.previewUrl} alt={`Preview de ${document.originalFileName}`} /> : <div className="preview-placeholder"><FileText size={54} /><strong>Preview indisponível</strong><p>O registro foi preservado, mas o arquivo binário existe somente durante a sessão do envio.</p></div>}</section>
        <section className="extracted-form"><div className="form-heading"><div><span>Dados extraídos</span><small>{document.documentType}</small></div><strong>{Math.round((document.confidence ?? 0) * 100)}% de confiança</strong></div>
          {document.status === 'approved' && <div className="finalized-banner"><Check size={17} />Cadastro finalizado. Os dados abaixo foram aprovados.</div>}
          <div className="provisional-banner"><AlertTriangle size={17} /><span><strong>Dados provisórios</strong>Confira todos os campos antes de finalizar.</span></div>
          <div className="field-list">{fields.map((field) => <label className={`extracted-field ${field.confidence < .8 ? 'extracted-field--warning' : ''}`} key={field.id}><span><strong>{field.label}</strong><small>Confiança: {Math.round(field.confidence * 100)}% {field.confidence < .8 ? '· Revisar' : ''}</small></span><input disabled={document.status === 'approved'} value={field.value} onChange={(event) => setFields((current) => current.map((item) => item.id === field.id ? { ...item, value: event.target.value } : item))} />{(field.manuallyEdited || field.value !== document.extractedFields.find(({ id }) => id === field.id)?.value) && <em>Corrigido manualmente</em>}</label>)}</div>
          {document.status !== 'approved' && <div className="form-actions"><button className="secondary-button action-save" type="button" disabled={!dirty || saving} onClick={() => void save()}><Save size={17} />{saving ? 'Salvando...' : 'Salvar alterações'}</button><button className="primary-button primary-button--button" type="button" disabled={dirty || saving} title={dirty ? 'Salve as alterações antes de aprovar' : undefined} onClick={() => void approve()}><Check size={18} />Aprovar documento</button></div>}
        </section>
      </div>
      <section className="panel audit-panel">
        <div className="panel-heading"><div><h2>Histórico do documento</h2><p>Registro demonstrativo das principais ações e decisões.</p></div><History size={20} aria-hidden="true" /></div>
        {document.events.length ? <ol className="audit-timeline">{[...document.events].reverse().map((event) => <li key={event.id}><span className={`audit-dot audit-dot--${event.type}`} /><div><strong>{event.description}</strong><small>{event.actor} · {eventDateFormatter.format(new Date(event.createdAt))}</small></div></li>)}</ol> : <div className="state-message audit-empty">Nenhum evento registrado para este documento legado.</div>}
      </section>
    </div>
  )
}
