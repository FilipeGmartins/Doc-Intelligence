import { beforeEach, describe, expect, it } from 'vitest'
import { MockConversationDatabase } from '../mocks/mockConversationDatabase'
import { MockPeopleDatabase } from '../mocks/mockPeopleDatabase'
import { MockDatabase } from '../mocks/mockDatabase'
import { MockConversationRepository } from '../repositories/MockConversationRepository'
import { MockDocumentRepository } from '../repositories/MockDocumentRepository'
import { MockPersonRepository } from '../repositories/MockPersonRepository'
import { ConversationService } from './conversationService'
import { DocumentService } from './documentService'
import { MockAIService } from './mockAIService'
import { PersonService } from './personService'

describe('ConversationService', () => {
  let conversations: ConversationService
  let people: PersonService
  let documents: DocumentService

  beforeEach(() => {
    localStorage.clear()
    people = new PersonService(new MockPersonRepository(new MockPeopleDatabase()))
    documents = new DocumentService(new MockDocumentRepository(new MockDatabase()), new MockAIService(0, 0), people)
    conversations = new ConversationService(
      new MockConversationRepository(new MockConversationDatabase()),
      people,
      0,
      documents,
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
    expect(ready.draft.documents).toEqual(['identidade_whatsapp_revisao_demo.pdf'])
    expect(ready.documentIds).toHaveLength(1)
    expect((await documents.getById(ready.documentIds![0])).status).toBe('review_required')
    expect((await people.list({ query: 'Maria Oliveira' }))[0].source).toBe('whatsapp')
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
    expect(approved.documentIds).toHaveLength(1)

    await documents.approve(approved.documentIds![0])
    const updatedPerson = (await people.list({ query: 'Gabriel Martins' }))[0]
    expect(updatedPerson.receivedDocuments).toContain('identity')
    expect(updatedPerson.missingDocuments).toEqual(['Comprovante de residência'])
  })
})
