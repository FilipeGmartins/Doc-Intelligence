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
      field.key === 'cpf' ? { ...field, value: '71428793860' } : field,
    )

    const updated = await service.update(document.id, { extractedFields: editedFields })
    expect(updated.extractedFields.find((field) => field.key === 'cpf')?.manuallyEdited).toBe(true)
    expect(updated.events.at(-1)?.type).toBe('manually_edited')
  })

  it('normaliza CPF e limita RG durante a correção humana', async () => {
    const document = await service.getById('doc-identidade-ficticia')
    const updated = await service.update(document.id, {
      extractedFields: [
        ...document.extractedFields.map((field) => field.key === 'cpf' ? { ...field, value: 'abc862.883.667-57xyz' } : field),
        { id: 'field-rg', key: 'rg', label: 'RG', value: '12.345.678-x99', confidence: 0.8, manuallyEdited: false },
      ],
    })

    expect(updated.extractedFields.find((field) => field.key === 'cpf')?.value).toBe('86288366757')
    expect(updated.extractedFields.find((field) => field.key === 'rg')?.value).toBe('12345678X')
  })

  it('recusa a persistência de CPF incompleto', async () => {
    const document = await service.getById('doc-identidade-ficticia')
    await expect(service.update(document.id, {
      extractedFields: document.extractedFields.map((field) => field.key === 'cpf' ? { ...field, value: '12345' } : field),
    })).rejects.toThrow('INVALID_CPF')
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

  it('registra recusa com motivo na trilha de auditoria', async () => {
    const rejected = await service.reject('doc-identidade-ficticia', 'Imagem cortada e ilegível')

    expect(rejected.status).toBe('rejected')
    expect(rejected.rejectionReason).toBe('Imagem cortada e ilegível')
    expect(rejected.events.at(-1)?.type).toBe('rejected')
    expect(rejected.events.at(-1)?.description).toContain('Imagem cortada')
  })

  it('não persiste URLs temporárias de preview entre sessões', () => {
    const database = new MockDatabase()
    database.write([{ ...mockDocuments[0], id: 'doc-preview-session', previewUrl: 'blob:http://localhost/temporario' }])

    expect(database.read()[0].previewUrl).toBeUndefined()
  })
})
