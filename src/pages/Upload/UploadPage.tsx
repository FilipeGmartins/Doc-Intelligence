import { AlertCircle, CheckCircle2, FileImage, FileText, LoaderCircle, RotateCcw, Trash2, UploadCloud } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DocumentStatusBadge } from '../../components/documents/DocumentStatusBadge'
import { documentService } from '../../services/documentService'
import type { DocumentRecord } from '../../types/document'
import { formatFileSize, validateDocumentFiles } from '../../utils/documentFiles'

interface SelectedDocument {
  id: string
  file: File
}

interface UploadError {
  id: string
  fileName: string
  reason: string
}

function selectionId(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`
}

export function UploadPage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [selected, setSelected] = useState<SelectedDocument[]>([])
  const [errors, setErrors] = useState<UploadError[]>([])
  const [jobs, setJobs] = useState<DocumentRecord[]>([])
  const [dragging, setDragging] = useState(false)
  const [processing, setProcessing] = useState(false)

  const addFiles = (incoming: File[]) => {
    const { valid, rejected } = validateDocumentFiles(incoming)
    setSelected((current) => [
      ...current,
      ...valid.map((file) => ({ id: selectionId(file), file })),
    ])
    setErrors((current) => [
      ...current,
      ...rejected.map(({ file, reason }) => ({ id: selectionId(file), fileName: file.name, reason })),
    ])
  }

  const processDocuments = async () => {
    if (!selected.length || processing) return
    setProcessing(true)
    setErrors([])

    try {
      const uploaded = await documentService.upload(selected.map(({ file }) => file))
      setJobs(uploaded)
      setSelected([])

      await Promise.all(uploaded.map(async (document) => {
        setJobs((current) => current.map((job) => job.id === document.id ? { ...job, status: 'processing' } : job))
        const result = await documentService.process(document.id)
        setJobs((current) => current.map((job) => job.id === result.id ? result : job))
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
    <div className="page upload-page">
      <div className="page-heading">
        <div><p className="eyebrow">Novo processamento</p><h1>Envie seus documentos</h1><p>Adicione arquivos para classificação e extração simuladas.</p></div>
      </div>

      <section className="upload-workspace">
        <div
          className={`dropzone ${dragging ? 'dropzone--active' : ''}`}
          onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false) }}
          onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(Array.from(event.dataTransfer.files)) }}
        >
          <input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => { addFiles(Array.from(event.target.files ?? [])); event.target.value = '' }} />
          <span className="dropzone-icon"><UploadCloud size={28} aria-hidden="true" /></span>
          <h2>Arraste arquivos até aqui</h2>
          <p>ou clique para selecionar no seu computador</p>
          <button type="button" className="secondary-button" onClick={() => inputRef.current?.click()}>Selecionar arquivos</button>
          <small>PDF, JPG, JPEG ou PNG · máximo de 10 MB por arquivo</small>
        </div>

        <aside className="scenario-guide">
          <strong>Como testar a simulação</strong>
          <p>O nome do arquivo determina um resultado reproduzível:</p>
          <ul>
            <li><span className="scenario-dot scenario-dot--green" />Nome comum: processado</li>
            <li><span className="scenario-dot scenario-dot--amber" /><code>revisao</code>: baixa confiança</li>
            <li><span className="scenario-dot scenario-dot--red" /><code>falha</code>: erro de processamento</li>
          </ul>
        </aside>
      </section>

      {errors.length > 0 && <section className="validation-errors" aria-label="Arquivos rejeitados">{errors.map((error) => <div key={error.id} role="alert"><AlertCircle size={17} /><span><strong>{error.fileName}</strong>{error.reason}</span><button type="button" aria-label={`Dispensar erro de ${error.fileName}`} onClick={() => setErrors((current) => current.filter(({ id }) => id !== error.id))}>×</button></div>)}</section>}

      {selected.length > 0 && (
        <section className="panel file-selection">
          <div className="panel-heading"><div><h2>Arquivos selecionados</h2><p>{selected.length} {selected.length === 1 ? 'documento pronto' : 'documentos prontos'} para envio.</p></div><button type="button" className="text-button" onClick={() => setSelected([])}>Remover todos</button></div>
          <div className="selected-list">{selected.map(({ id, file }) => <div className="selected-file" key={id}><span className="file-type-icon">{file.type === 'application/pdf' ? <FileText size={20} /> : <FileImage size={20} />}</span><span className="selected-file-name"><strong>{file.name}</strong><small>{file.type || 'Tipo identificado pela extensão'} · {formatFileSize(file.size)}</small></span><button type="button" className="icon-button icon-button--danger" aria-label={`Remover ${file.name}`} onClick={() => setSelected((current) => current.filter((item) => item.id !== id))}><Trash2 size={17} /></button></div>)}</div>
          <div className="selection-actions"><button type="button" className="primary-button primary-button--button" disabled={processing} onClick={() => void processDocuments()}>{processing ? <LoaderCircle className="spin" size={18} /> : <UploadCloud size={18} />}{processing ? 'Processando...' : 'Processar documentos'}</button></div>
        </section>
      )}

      {jobs.length > 0 && (
        <section className="panel processing-panel" aria-live="polite">
          <div className="panel-heading"><div><h2>{finished ? 'Processamento concluído' : 'Processando documentos'}</h2><p>{finished ? 'Confira os resultados simulados abaixo.' : 'Isso pode levar alguns segundos.'}</p></div>{finished && <CheckCircle2 className="completion-icon" size={25} />}</div>
          <div className="job-list">{jobs.map((document) => <article className="processing-job" key={document.id}><span className="file-type-icon"><FileText size={20} /></span><span className="job-name"><strong>{document.originalFileName}</strong><small>{document.processingError ?? document.documentType}</small></span><DocumentStatusBadge status={document.status} /><span className="job-confidence">{document.confidence === null ? '—' : `${Math.round(document.confidence * 100)}%`}</span>{document.status === 'failed' ? <button className="retry-button" type="button" onClick={() => void retry(document)}><RotateCcw size={15} />Tentar novamente</button> : null}</article>)}</div>
          {finished && <div className="result-actions"><Link className="secondary-button secondary-button--link" to="/documents">Ver documentos</Link>{jobs.some(({ status }) => status === 'review_required') && <Link className="primary-button" to="/review">Ir para conferência</Link>}</div>}
        </section>
      )}
    </div>
  )
}
