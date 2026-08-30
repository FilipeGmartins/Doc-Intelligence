import { beforeEach, describe, expect, it } from 'vitest'
import { MockDatabase } from '../mocks/mockDatabase'
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
})
