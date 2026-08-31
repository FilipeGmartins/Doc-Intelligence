import { BadgeCheck, Bot, Check, Clock3, FileCheck2, FileUp, Info, MessageCircleMore, RotateCcw, Send, UserRoundCheck } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ConversationStatusBadge } from '../../components/conversations/ConversationStatusBadge'
import { useConversations } from '../../hooks/useConversations'
import type { IntakeStep } from '../../types/conversation'
import { DOCUMENT_CATEGORY_OPTIONS } from '../../types/document'

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })

const placeholderByStep: Record<IntakeStep, string> = {
  name: 'Digite um nome fictício...',
  identifier: 'Ex.: CPF •••.123.•••-00',
  email: 'Ex.: pessoa@exemplo.test',
  address: 'Digite um endereço fictício...',
  document: 'Envie o documento pelo botão ao lado',
  complete: 'Coleta encerrada',
}

function getInitials(name: string) {
  if (name === 'Contato não identificado') return '?'
  return name.split(' ').slice(0, 2).map((part) => part[0]).join('')
}

export function WhatsAppPage() {
  const { conversations, loading, error, reload, reply, attachMockDocument, approve, resetDemo } = useConversations()
  const [selectedId, setSelectedId] = useState<string>('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [feedback, setFeedback] = useState('')

  const selected = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? conversations[0],
    [conversations, selectedId],
  )

  const summary = {
    active: conversations.filter((item) => ['new_contact', 'collecting_data'].includes(item.status)).length,
    review: conversations.filter((item) => ['awaiting_internal_review', 'awaiting_document_review'].includes(item.status)).length,
    approved: conversations.filter((item) => item.status === 'approved').length,
  }
  const requestedDocumentLabel = DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === selected?.requestedCategory)?.label ?? 'documento solicitado'

  const execute = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true)
    setFeedback('')
    try {
      await operation()
      setMessage('')
      setFeedback(success)
    } catch {
      setFeedback('Não foi possível concluir esta ação simulada.')
    } finally {
      setBusy(false)
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!selected || !message.trim()) return
    void execute(() => reply(selected.id, message), 'Resposta registrada e pré-cadastro atualizado.')
  }

  return (
    <div className="page whatsapp-page">
      <div className="page-heading whatsapp-heading">
        <div><p className="eyebrow">Automação demonstrativa</p><h1>Atendimentos WhatsApp</h1><p>Simule a coleta inicial de dados e transforme conversas em pré-cadastros para validação interna.</p></div>
        <div className="whatsapp-heading-actions"><div className="mock-channel-label"><MessageCircleMore size={19} aria-hidden="true" /><span><strong>Canal simulado</strong><small>Nenhuma mensagem real é enviada</small></span></div><button className="secondary-button reset-demo-button" type="button" disabled={busy} onClick={() => void execute(resetDemo, 'Demonstração reiniciada.')}><RotateCcw size={15} />Reiniciar demo</button></div>
      </div>

      <div className="whatsapp-summary" aria-label="Resumo dos atendimentos">
        <span><Bot size={16} aria-hidden="true" /><strong>{summary.active}</strong> em coleta</span>
        <span><Clock3 size={16} aria-hidden="true" /><strong>{summary.review}</strong> aguardando equipe</span>
        <span><BadgeCheck size={16} aria-hidden="true" /><strong>{summary.approved}</strong> finalizados</span>
      </div>

      <div className="automation-note"><Info size={17} aria-hidden="true" /><p><strong>Fluxo integrado:</strong> o envio cria um cadastro provisório e coloca o documento na Conferência. A aprovação atualiza Pessoas e solicita o próximo item pendente; a recusa pede um reenvio com o motivo.</p></div>

      {error ? <div className="feedback feedback--error"><span>{error}</span><button type="button" onClick={() => void reload()}>Tentar novamente</button></div> : null}

      <section className="whatsapp-workspace">
        <aside className="conversation-queue" aria-label="Fila de atendimentos">
          <div className="conversation-queue-heading"><div><strong>Conversas</strong><small>{conversations.length} atendimentos fictícios</small></div><span>{summary.review}</span></div>
          {loading ? <div className="state-message">Carregando...</div> : conversations.map((conversation) => (
            <button className={`conversation-card ${selected?.id === conversation.id ? 'conversation-card--active' : ''}`} type="button" key={conversation.id} onClick={() => { setSelectedId(conversation.id); setFeedback('') }}>
              <span className="conversation-avatar">{getInitials(conversation.displayName)}</span>
              <span className="conversation-card-content"><strong>{conversation.displayName}</strong><small>{conversation.phone}</small><span className="conversation-progress"><i style={{ width: `${conversation.completion}%` }} /></span><em>{conversation.completion}% coletado</em></span>
              <ConversationStatusBadge status={conversation.status} />
            </button>
          ))}
        </aside>

        {selected ? <div className="intake-surface">
          <section className="chat-panel" aria-label={`Conversa com ${selected.displayName}`}>
            <header className="chat-heading"><span className="conversation-avatar">{getInitials(selected.displayName)}</span><div><strong>{selected.displayName}</strong><small>{selected.phone} · atendimento simulado</small></div><ConversationStatusBadge status={selected.status} /></header>
            <div className="chat-thread" aria-live="polite">{selected.messages.map((item) => (
              <div className={`chat-message chat-message--${item.sender}`} key={item.id}><span>{item.sender === 'bot' ? <Bot size={14} aria-hidden="true" /> : item.sender === 'system' ? <BadgeCheck size={14} aria-hidden="true" /> : null}{item.content}</span><small>{timeFormatter.format(new Date(item.createdAt))}</small></div>
            ))}</div>
            <form className="chat-composer" onSubmit={handleSubmit}>
              <label className="sr-only" htmlFor="mock-message">Resposta fictícia do cliente</label>
              <input id="mock-message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={selected.currentStep === 'document' ? `Enviar ${requestedDocumentLabel.toLocaleLowerCase('pt-BR')}` : placeholderByStep[selected.currentStep]} disabled={busy || ['document', 'complete'].includes(selected.currentStep)} />
              {selected.currentStep === 'document' ? <button className="attach-button" type="button" disabled={busy} onClick={() => void execute(() => attachMockDocument(selected.id), `${requestedDocumentLabel} fictício recebido e enviado à conferência.`)}><FileUp size={17} />Simular documento</button> : <button className="send-button" type="submit" disabled={busy || !message.trim() || selected.currentStep === 'complete'} aria-label="Enviar resposta simulada"><Send size={17} /></button>}
            </form>
          </section>

          <aside className="intake-draft" aria-label="Pré-cadastro extraído da conversa">
            <div className="intake-draft-heading"><div><strong>Pré-cadastro</strong><small>Atualizado pela conversa</small></div><span>{selected.completion}%</span></div>
            <div className="intake-progress"><i style={{ width: `${selected.completion}%` }} /></div>
            <div className="draft-fields">
              <DraftField label="Nome completo" value={selected.draft.name} />
              <DraftField label="Identificação" value={selected.draft.identifier} />
              <DraftField label="E-mail" value={selected.draft.email} />
              <DraftField label="Endereço" value={selected.draft.address} />
              <DraftField label="Último documento" value={selected.draft.documents.at(-1) ?? ''} />
            </div>
            <div className="intake-actions">
              {feedback ? <p className="intake-feedback">{feedback}</p> : null}
              {selected.status === 'awaiting_internal_review' ? <button className="primary-button primary-button--button" type="button" disabled={busy} onClick={() => void execute(() => approve(selected.id), 'Pré-cadastro validado. O documento está na fila de conferência.')}><UserRoundCheck size={17} />Validar pré-cadastro</button> : null}
              {selected.status === 'awaiting_document_review' ? <div className="intake-approved intake-approved--waiting"><Clock3 size={17} /><span><strong>Documento em conferência</strong><small>A equipe interna precisa aprovar ou solicitar um reenvio.</small></span></div> : null}
              {selected.status === 'awaiting_document_review' ? <Link className="secondary-button secondary-button--link" to="/review"><FileCheck2 size={15} />Abrir Conferência</Link> : null}
              {selected.status === 'approved' ? <div className="intake-approved"><Check size={17} /><span><strong>Pré-cadastro validado</strong><small>O recebimento será confirmado após a aprovação documental.</small></span></div> : null}
              {selected.status === 'approved' && selected.documentIds?.length ? <Link className="secondary-button secondary-button--link" to="/review"><FileCheck2 size={15} />Abrir Conferência</Link> : null}
              {selected.status === 'approved' ? <Link className="secondary-button secondary-button--link" to="/people">Abrir Pessoas</Link> : null}
              {['new_contact', 'collecting_data'].includes(selected.status) && !selected.approvedPersonId ? <p className="awaiting-copy"><Clock3 size={15} />Complete a conversa para liberar a validação interna.</p> : null}
              {selected.status === 'collecting_data' && selected.approvedPersonId ? <p className="awaiting-copy"><Clock3 size={15} />Aguardando o envio de {requestedDocumentLabel.toLocaleLowerCase('pt-BR')}.</p> : null}
            </div>
          </aside>
        </div> : <div className="state-message">Selecione um atendimento.</div>}
      </section>
      <p className="demo-note">Protótipo local · não utiliza a API do WhatsApp nem dados pessoais reais.</p>
    </div>
  )
}

function DraftField({ label, value }: { label: string; value: string }) {
  return <div className={`draft-field ${value ? 'draft-field--filled' : ''}`}><span>{value ? <Check size={13} aria-hidden="true" /> : <Clock3 size={13} aria-hidden="true" />}{label}</span><strong>{value || 'Aguardando resposta'}</strong></div>
}
