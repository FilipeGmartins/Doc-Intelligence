import { beforeEach, describe, expect, it } from 'vitest'
import { MockDatabase } from '../mocks/mockDatabase'
import { mockDocuments } from '../mocks/mockDocuments'
import { MockDocumentRepository } from '../repositories/MockDocumentRepository'
import { DocumentService } from './documentService'
import { MockAIService } from './mockAIService'

describe('DocumentService', () => {
  let service: DocumentService

  beforeEach(() => {
    localStorage.clear()
    service = new DocumentService(
      new MockDocumentRepository(new MockDatabase()),
      new MockAIService(0, 0),
    )
  })

  it('persiste upload e processa cenário de baixa confiança', async () => {
    const [uploaded] = await service.upload([
      new File(['fictício'], 'identidade_revisao.pdf', { type: 'application/pdf' }),
    ])

    expect(uploaded.status).toBe('pending')
    expect((await service.process(uploaded.id)).status).toBe('review_required')
    expect((await service.getById(uploaded.id)).confidence).toBe(0.68)
  })

  it('marca um campo alterado como corrigido manualmente', async () => {
    const document = await service.getById('doc-identidade-ficticia')
    const editedFields = document.extractedFields.map((field) =>
      field.key === 'cpf' ? { ...field, value: '000.111.222-44' } : field,
    )

    const updated = await service.update(document.id, { extractedFields: editedFields })
    expect(updated.extractedFields.find((field) => field.key === 'cpf')?.manuallyEdited).toBe(true)
    expect(updated.events.at(-1)?.type).toBe('manually_edited')
  })

  it('registra falha e permite tentar novamente', async () => {
    const [uploaded] = await service.upload([
      new File(['fictício'], 'contrato_falha.pdf', { type: 'application/pdf' }),
    ])

    const failed = await service.process(uploaded.id)
    expect(failed.status).toBe('failed')
    expect(failed.processingError).toBe('Não foi possível processar este documento.')
    expect((await service.reprocess(uploaded.id)).status).toBe('failed')
  })

  it('busca documentos por nome ou tipo e filtra por status', async () => {
    const byName = await service.list({ query: 'maria' })
    const byType = await service.list({ query: 'identidade' })
    const failed = await service.list({ status: 'failed' })

    expect(byName.map((document) => document.id)).toEqual(['doc-comprovante-ficticio'])
    expect(byType.map((document) => document.id)).toEqual(['doc-identidade-ficticia'])
    expect(failed.map((document) => document.id)).toEqual(['doc-falha-ficticia'])
  })

  it('processa contracheque conforme o tipo esperado pelo atendimento', async () => {
    const result = await service.uploadForPerson([{
      file: new File(['fictício'], 'arquivo_cliente.pdf', { type: 'application/pdf', lastModified: 1 }),
      personId: 'person-carlos-santos',
      expectedCategory: 'payslip',
    }])
    const processed = await service.process(result.created[0].id)

    expect(processed.documentType).toBe('Contracheque')
    expect(processed.extractedFields.map((field) => field.key)).toContain('netAmount')
    expect(processed.events.map((event) => event.type)).toEqual(['uploaded', 'processing_started', 'processed'])
  })

  it('identifica reenvio duplicado para o mesmo cliente', async () => {
    const input = {
      file: new File(['fictício'], 'identidade_nova.pdf', { type: 'application/pdf', lastModified: 1 }),
      personId: 'person-carlos-santos',
      expectedCategory: 'identity' as const,
    }
    const first = await service.uploadForPerson([input])
    const second = await service.uploadForPerson([input])

    expect(first.created).toHaveLength(1)
    expect(second.created).toHaveLength(0)
    expect(second.duplicates[0].existingDocumentId).toBe(first.created[0].id)
  })

  it('registra aprovação na trilha de auditoria', async () => {
    const approved = await service.approve('doc-identidade-ficticia')
    expect(approved.events.at(-1)?.type).toBe('approved')
    expect(approved.events.at(-1)?.actor).toBe('Ana Souza')
  })

  it('não persiste URLs temporárias de preview entre sessões', () => {
    const database = new MockDatabase()
    database.write([{ ...mockDocuments[0], id: 'doc-preview-session', previewUrl: 'blob:http://localhost/temporario' }])

    expect(database.read()[0].previewUrl).toBeUndefined()
  })
})
