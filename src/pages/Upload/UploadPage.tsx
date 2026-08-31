import { AlertCircle, Check, CheckCircle2, FileText, LoaderCircle, RotateCcw, UploadCloud, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { usePeople } from '../../hooks/usePeople'
import { documentService } from '../../services/documentService'
import { DOCUMENT_CATEGORY_OPTIONS, type DocumentCategory, type DocumentRecord } from '../../types/document'
import { formatFileSize, validateDocumentFiles } from '../../utils/documentFiles'

interface UploadError {
  id: string
  fileName: string
  reason: string
}

export function UploadPage() {
  const { people, loading: loadingPeople } = usePeople()
  const [personId, setPersonId] = useState('')
  const [categories, setCategories] = useState<DocumentCategory[]>([])
  const [files, setFiles] = useState<Partial<Record<DocumentCategory, File>>>({})
  const [errors, setErrors] = useState<UploadError[]>([])
  const [jobs, setJobs] = useState<DocumentRecord[]>([])
  const [processing, setProcessing] = useState(false)

  const person = people.find((item) => item.id === personId)
  const recommended = person?.documentRequirements ?? []
  const selectedFiles = categories.flatMap((category) => files[category] ? [{ category, file: files[category] }] : []) as Array<{ category: DocumentCategory; file: File }>

  const selectPerson = (nextPersonId: string) => {
    const nextPerson = people.find((item) => item.id === nextPersonId)
    setPersonId(nextPersonId)
    setCategories(nextPerson?.documentRequirements ?? [])
    setFiles({})
    setJobs([])
    setErrors([])
  }

  const toggleCategory = (category: DocumentCategory) => {
    setCategories((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category])
    if (categories.includes(category)) setFiles((current) => ({ ...current, [category]: undefined }))
  }

  const chooseFile = (category: DocumentCategory, incoming: File | undefined) => {
    if (!incoming) return
    const { valid, rejected } = validateDocumentFiles([incoming])
    if (rejected[0]) {
      setErrors((current) => [...current, { id: crypto.randomUUID(), fileName: incoming.name, reason: rejected[0].reason }])
      return
    }
    setFiles((current) => ({ ...current, [category]: valid[0] }))
  }

  const processDocuments = async () => {
    if (!personId || !selectedFiles.length || processing) return
    setProcessing(true)
    setErrors([])

    try {
      const result = await documentService.uploadForPerson(selectedFiles.map(({ category, file }) => ({ file, personId, expectedCategory: category })))
      setJobs(result.created)
      setFiles({})
      setErrors(result.duplicates.map((duplicate) => ({
        id: crypto.randomUUID(),
        fileName: duplicate.fileName,
        reason: 'Possível duplicidade: este cliente já possui um arquivo com o mesmo nome e tamanho.',
      })))

      await Promise.all(result.created.map(async (document) => {
        setJobs((current) => current.map((job) => job.id === document.id ? { ...job, status: 'processing' } : job))
        const processed = await documentService.process(document.id)
        setJobs((current) => current.map((job) => job.id === processed.id ? processed : job))
      }))
    } catch {
      setErrors([{ id: crypto.randomUUID(), fileName: 'Envio', reason: 'Não foi possível iniciar o processamento.' }])
    } finally {
      setProcessing(false)
    }
  }

  const retry = async (document: DocumentRecord) => {
    setJobs((current) => current.map((job) => job.id === document.id ? { ...job, status: 'processing', processingError: undefined } : job))
    const result = await documentService.reprocess(document.id)
    setJobs((current) => current.map((job) => job.id === result.id ? result : job))
  }

  const finished = jobs.length > 0 && jobs.every(({ status }) => !['pending', 'processing'].includes(status))

  return (
    <div className="page upload-page client-upload-page">
      <div className="page-heading">
        <div><p className="eyebrow">Plano documental</p><h1>Documentos por cliente</h1><p>Defina quais documentos se aplicam a cada pessoa e envie os arquivos nos espaços correspondentes.</p></div>
      </div>

      <section className="client-selector panel">
        <div className="client-selector-icon"><UserRound size={22} aria-hidden="true" /></div>
        <label><span>Cliente do atendimento</span><select value={personId} disabled={loadingPeople} onChange={(event) => selectPerson(event.target.value)}><option value="">Selecione uma pessoa...</option>{people.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <p>{person ? `${person.identifier} · ${person.email}` : 'A seleção vincula os documentos ao cadastro fictício escolhido.'}</p>
      </section>

      {person ? <>
        <section className="document-plan panel">
          <div className="panel-heading"><div><h2>Quais documentos serão enviados?</h2><p>As sugestões do cadastro já estão marcadas. Ajuste a lista conforme este atendimento.</p></div><span className="plan-count">{categories.length} selecionados</span></div>
          <div className="document-checklist">{DOCUMENT_CATEGORY_OPTIONS.map((option) => {
            const checked = categories.includes(option.value)
            return <label className={`document-check ${checked ? 'document-check--selected' : ''}`} key={option.value}><input type="checkbox" checked={checked} onChange={() => toggleCategory(option.value)} /><span className="custom-checkbox">{checked ? <Check size={14} aria-hidden="true" /> : null}</span><span><strong>{option.label}</strong><small>{option.description}</small></span>{recommended.includes(option.value) ? <em>Sugerido</em> : null}</label>
          })}</div>
        </section>

        {categories.length > 0 ? <section className="document-slots panel">
          <div className="panel-heading"><div><h2>Arquivos deste cliente</h2><p>Adicione um arquivo para cada tipo disponível neste atendimento.</p></div><span className="slot-progress">{selectedFiles.length} de {categories.length} anexados</span></div>
          <div className="document-slot-list">{categories.map((category) => {
            const option = DOCUMENT_CATEGORY_OPTIONS.find((item) => item.value === category)!
            const file = files[category]
            return <article className={`document-slot ${file ? 'document-slot--ready' : ''}`} key={category}><span className="file-type-icon"><FileText size={20} aria-hidden="true" /></span><div><strong>{option.label}</strong><small>{file ? `${file.name} · ${formatFileSize(file.size)}` : 'Nenhum arquivo selecionado'}</small></div><label className="secondary-button slot-file-button"><input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => { chooseFile(category, event.target.files?.[0]); event.target.value = '' }} />{file ? 'Substituir' : 'Selecionar arquivo'}</label></article>
          })}</div>
          <div className="selection-actions"><p>Você pode processar somente os arquivos já disponíveis e completar o restante depois.</p><button type="button" className="primary-button primary-button--button" disabled={!selectedFiles.length || processing} onClick={() => void processDocuments()}>{processing ? <LoaderCircle className="spin" size={18} /> : <UploadCloud size={18} />}{processing ? 'Processando...' : `Processar ${selectedFiles.length || ''} ${selectedFiles.length === 1 ? 'arquivo' : 'arquivos'}`}</button></div>
        </section> : <div className="empty-selection"><FileText size={28} /><span>Marque pelo menos um tipo de documento para liberar os espaços de envio.</span></div>}
      </> : <section className="client-upload-empty"><UserRound size={34} /><h2>Comece selecionando o cliente</h2><p>Cada cadastro pode ter uma combinação diferente de documentos necessários.</p></section>}

      {errors.length > 0 ? <section className="validation-errors" aria-label="Avisos do envio">{errors.map((error) => <div key={error.id} role="alert"><AlertCircle size={17} /><span><strong>{error.fileName}</strong>{error.reason}</span><button type="button" aria-label={`Dispensar aviso de ${error.fileName}`} onClick={() => setErrors((current) => current.filter(({ id }) => id !== error.id))}>×</button></div>)}</section> : null}

      {jobs.length > 0 ? <section className="panel processing-panel" aria-live="polite">
        <div className="panel-heading"><div><h2>{finished ? 'Processamento concluído' : 'Processando documentos'}</h2><p>{finished ? 'Confira os resultados simulados abaixo.' : 'Os modelos variam conforme o tipo escolhido.'}</p></div>{finished ? <CheckCircle2 className="completion-icon" size={25} /> : null}</div>
        <div className="job-list">{jobs.map((document) => <article className="processing-job" key={document.id}><span className="file-type-icon"><FileText size={20} /></span><span className="job-name"><strong>{document.originalFileName}</strong><small>{document.processingError ?? document.documentType}</small></span><DocumentStatusBadge status={document.status} /><span className="job-confidence">{document.confidence === null ? '—' : `${Math.round(document.confidence * 100)}%`}</span>{document.status === 'failed' ? <button className="retry-button" type="button" onClick={() => void retry(document)}><RotateCcw size={15} />Tentar novamente</button> : null}</article>)}</div>
        {finished ? <div className="result-actions"><Link className="secondary-button secondary-button--link" to="/documents">Ver documentos</Link>{jobs.some(({ status }) => status === 'review_required') ? <Link className="primary-button" to="/review">Ir para conferência</Link> : null}</div> : null}
      </section> : null}
    </div>
  )
}
