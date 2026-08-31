import { describe, expect, it } from 'vitest'
import { PersonService } from './personService'

describe('PersonService', () => {
  const service = new PersonService()

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
})
