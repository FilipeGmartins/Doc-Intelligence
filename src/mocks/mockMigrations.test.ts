import { beforeEach, describe, expect, it } from 'vitest'
import { mockConversations } from './mockConversations'
import { MockConversationDatabase } from './mockConversationDatabase'
import { MockDatabase } from './mockDatabase'
import { mockDocuments } from './mockDocuments'
import { mockPeople } from './mockPeople'
import { MockPeopleDatabase } from './mockPeopleDatabase'

describe('migrações do armazenamento local', () => {
  beforeEach(() => localStorage.clear())

  it('substitui o CPF antigo de uma pessoa de demonstração pelo valor válido atual', () => {
    localStorage.setItem('doc-intelligence:people:v1', JSON.stringify([
      { ...mockPeople[0], identifier: '123.456.789-01' },
    ]))

    const people = new MockPeopleDatabase().read()

    expect(people[0].identifier).toBe(mockPeople[0].identifier)
    expect(localStorage.getItem('doc-intelligence:people:v2')).not.toBeNull()
  })

  it('sinaliza um cadastro manual com CPF legado inválido para revisão', () => {
    localStorage.setItem('doc-intelligence:people:v1', JSON.stringify([
      { ...mockPeople[0], id: 'person-manual-legada', identifier: '123', documentStatus: 'complete' },
    ]))

    const [person] = new MockPeopleDatabase().read()

    expect(person.identifier).toBe('123')
    expect(person.documentStatus).toBe('update_required')
    expect(person.updateReason).toMatch(/CPF precisa ser revisado/)
  })

  it('normaliza campos de documento e registra a migração na auditoria uma única vez', () => {
    const legacyDocument = structuredClone(mockDocuments[0])
    legacyDocument.extractedFields[1].value = '862.883.667-57'
    localStorage.setItem('doc-intelligence:documents:v1', JSON.stringify([legacyDocument]))

    const database = new MockDatabase()
    const [migrated] = database.read()
    const [secondRead] = database.read()

    expect(migrated.extractedFields[1].value).toBe('86288366757')
    expect(migrated.events.at(-1)).toMatchObject({ actor: 'Migração local', type: 'manually_edited' })
    expect(secondRead.events.filter((event) => event.actor === 'Migração local')).toHaveLength(1)
  })

  it('retoma no CPF uma conversa não semeada que continha um identificador inválido', () => {
    const legacyConversation = {
      ...structuredClone(mockConversations[1]),
      id: 'intake-legado-manual',
      draft: { ...structuredClone(mockConversations[1].draft), identifier: '11111111111' },
    }
    localStorage.setItem('doc-intelligence:whatsapp-intakes:v1', JSON.stringify([legacyConversation]))

    const [conversation] = new MockConversationDatabase().read()

    expect(conversation.currentStep).toBe('identifier')
    expect(conversation.status).toBe('collecting_data')
    expect(conversation.draft.identifier).toBe('')
    expect(conversation.messages.at(-1)?.id).toBe('message-identifier-migration-intake-legado-manual')
  })
})
