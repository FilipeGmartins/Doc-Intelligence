import { beforeEach, describe, expect, it } from 'vitest'
import { MockConversationDatabase } from '../mocks/mockConversationDatabase'
import { MockPeopleDatabase } from '../mocks/mockPeopleDatabase'
import { MockConversationRepository } from '../repositories/MockConversationRepository'
import { MockPersonRepository } from '../repositories/MockPersonRepository'
import { ConversationService } from './conversationService'
import { PersonService } from './personService'

describe('ConversationService', () => {
  let conversations: ConversationService
  let people: PersonService

  beforeEach(() => {
    localStorage.clear()
    people = new PersonService(new MockPersonRepository(new MockPeopleDatabase()))
    conversations = new ConversationService(
      new MockConversationRepository(new MockConversationDatabase()),
      people,
      0,
    )
  })

  it('avança a coleta guiada até aguardar o documento', async () => {
    const id = 'intake-maria-demo'
    expect((await conversations.reply(id, 'CPF •••.555.•••-00')).currentStep).toBe('email')
    expect((await conversations.reply(id, 'maria@exemplo.test')).currentStep).toBe('address')
    const address = await conversations.reply(id, 'Rua Fictícia, 100 · Natal/RN')

    expect(address.currentStep).toBe('document')
    expect(address.completion).toBe(80)

    const ready = await conversations.attachMockDocument(id)
    expect(ready.status).toBe('awaiting_internal_review')
    expect(ready.draft.documents).toEqual(['identidade_whatsapp_demo.pdf'])
  })

  it('transforma um pré-cadastro validado em pessoa sem duplicidade', async () => {
    const approved = await conversations.approve('intake-gabriel-review')
    const approvedAgain = await people.createFromIntake({
      sourceReference: 'intake-gabriel-review',
      name: 'Gabriel Martins',
      identifier: 'CPF •••.321.•••-09',
      email: 'gabriel.martins@exemplo.test',
      documentCount: 1,
    })

    expect(approved.status).toBe('approved')
    expect(approved.approvedPersonId).toBe(approvedAgain.id)
    expect((await people.list({ query: 'Gabriel Martins' }))).toHaveLength(1)
  })
})
