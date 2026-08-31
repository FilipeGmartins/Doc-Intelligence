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
    expect((await service.list({ query: '175' })).map((person) => person.id)).toEqual(['person-carlos-santos'])
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
      identifier: 'CPF •••.914.•••-65',
      email: 'roberto.alves@exemplo.test',
      documentRequirements: ['identity', 'work_card', 'payslip', 'bank_check'],
      receivedDocuments: ['identity', 'work_card', 'payslip'],
    })

    expect(updated.documentStatus).toBe('pending_document')
    expect(updated.missingDocuments).toEqual(['Cheque'])
    expect((await service.list({ query: 'roberto' }))[0].documentRequirements).toContain('bank_check')
  })
})
