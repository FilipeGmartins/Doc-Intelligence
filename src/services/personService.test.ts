import { beforeEach, describe, expect, it } from 'vitest'
import { MockPeopleDatabase } from '../mocks/mockPeopleDatabase'
import { MockPersonRepository } from '../repositories/MockPersonRepository'
import { PersonService } from './personService'

describe('PersonService', () => {
  let service: PersonService

  beforeEach(() => {
    localStorage.clear()
    service = new PersonService(new MockPersonRepository(new MockPeopleDatabase()))
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

  it('cria uma pessoa de origem WhatsApp sem duplicar o atendimento', async () => {
    const input = { sourceReference: 'intake-01', name: 'Pessoa Teste', identifier: 'CPF •••.000.•••-00', email: 'teste@exemplo.test', documentCount: 1 }
    const first = await service.createFromIntake(input)
    const second = await service.createFromIntake(input)

    expect(first.source).toBe('whatsapp')
    expect(second.id).toBe(first.id)
    expect((await service.list({ query: 'Pessoa Teste' }))).toHaveLength(1)
  })
})
