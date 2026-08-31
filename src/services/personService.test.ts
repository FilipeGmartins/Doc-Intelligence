import { beforeEach, describe, expect, it } from 'vitest'
import { PersonService } from './personService'

describe('PersonService', () => {
  let service: PersonService

  beforeEach(() => {
    localStorage.clear()
    service = new PersonService()
  })

  it('busca pessoas por nome, CPF ou e-mail', async () => {
    expect((await service.list({ query: 'mariana' })).map((person) => person.id)).toEqual(['person-mariana-costa'])
    expect((await service.list({ query: '111' })).map((person) => person.id)).toEqual(['person-carlos-santos'])
    expect((await service.list({ query: 'juliana.rocha' })).map((person) => person.id)).toEqual(['person-juliana-rocha'])
  })

  it('filtra pessoas pela situação documental', async () => {
    const pending = await service.list({ status: 'pending_document' })
    expect(pending).toHaveLength(2)
    expect(pending.every((person) => person.documentStatus === 'pending_document')).toBe(true)
  })

  it('recalcula pendências ao editar documentos exigidos e recebidos', async () => {
    const updated = await service.update('person-roberto-alves', {
      name: 'Roberto Alves Nascimento',
      identifier: '98765432100',
      email: 'roberto.alves@exemplo.test',
      documentRequirements: ['identity', 'work_card', 'payslip', 'bank_check'],
      receivedDocuments: ['identity', 'work_card', 'payslip'],
    })

    expect(updated.documentStatus).toBe('pending_document')
    expect(updated.missingDocuments).toEqual(['Cheque'])
    expect((await service.list({ query: 'roberto' }))[0].documentRequirements).toContain('bank_check')
  })

  it('cria uma pessoa provisória do WhatsApp sem duplicidade', async () => {
    const input = { sourceReference: 'intake-01', name: 'Pessoa Teste', identifier: '71428793860', email: 'teste@exemplo.test', documentCount: 0 }
    const first = await service.createFromIntake(input)
    const second = await service.createFromIntake(input)

    expect(first.source).toBe('whatsapp')
    expect(first.documentRequirements).toEqual(['identity', 'proof_of_residence'])
    expect(second.id).toBe(first.id)
    expect((await service.list({ query: 'Pessoa Teste' }))).toHaveLength(1)
  })

  it('marca o documento aprovado como recebido e mantém somente o restante pendente', async () => {
    const updated = await service.markDocumentReceived('person-carlos-santos', 'proof_of_residence')
    expect(updated.receivedDocuments).toContain('proof_of_residence')
    expect(updated.missingDocuments).toEqual(['Contracheque'])
  })

  it('cria um cliente manual com requisitos próprios', async () => {
    const created = await service.createManual({
      name: 'Cliente Demonstração',
      identifier: '71428793860',
      email: 'cliente.novo@exemplo.test',
      documentRequirements: ['identity', 'contract'],
    })

    expect(created.source).toBe('manual')
    expect(created.documentRequirements).toEqual(['identity', 'contract'])
    expect(created.missingDocuments).toEqual(['Documento de identidade', 'Contrato'])
    expect((await service.list({ query: 'cliente.novo' }))[0].id).toBe(created.id)
  })

  it('impede duplicidade manual por identificação ou e-mail', async () => {
    await expect(service.createManual({
      name: 'Carlos duplicado',
      identifier: '11144477735',
      email: 'outro@exemplo.test',
      documentRequirements: ['identity'],
    })).rejects.toThrow('PERSON_ALREADY_EXISTS')
  })

  it('exige exatamente 11 números no CPF', async () => {
    await expect(service.createManual({
      name: 'CPF incompleto',
      identifier: 'abc12345',
      email: 'cpf.incompleto@exemplo.test',
      documentRequirements: ['identity'],
    })).rejects.toThrow('INVALID_CPF')
  })
})
