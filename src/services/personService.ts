import { MockPersonRepository } from '../repositories/MockPersonRepository'
import type { PersonRepository } from '../repositories/PersonRepository'
import { DOCUMENT_CATEGORY_OPTIONS, type DocumentCategory } from '../types/document'
import type { CreateManualPersonInput, CreatePersonFromIntakeInput, PersonListFilters, PersonRecord, UpdatePersonInput } from '../types/person'
import { isValidCpf, sanitizeCpf } from '../utils/personalIdentifiers'

export interface PersonServiceContract {
  list(filters?: PersonListFilters): Promise<PersonRecord[]>
  update(id: string, input: UpdatePersonInput): Promise<PersonRecord>
  createFromIntake(input: CreatePersonFromIntakeInput): Promise<PersonRecord>
  createManual(input: CreateManualPersonInput): Promise<PersonRecord>
  markDocumentReceived(id: string, category: DocumentCategory): Promise<PersonRecord>
  resetDemo(): Promise<PersonRecord[]>
}

export class PersonService implements PersonServiceContract {
  private readonly repository: PersonRepository

  constructor(repository: PersonRepository = new MockPersonRepository()) {
    this.repository = repository
  }

  list(filters: PersonListFilters = {}): Promise<PersonRecord[]> {
    return this.repository.findAll(filters)
  }

  async update(id: string, input: UpdatePersonInput): Promise<PersonRecord> {
    const current = (await this.repository.findAll()).find((person) => person.id === id)
    if (!current) throw new Error('PERSON_NOT_FOUND')

    const identifier = sanitizeCpf(input.identifier)
    if (!isValidCpf(identifier)) throw new Error('INVALID_CPF')

    return this.repository.update(id, this.recalculate({
      ...current,
      name: input.name.trim(),
      identifier,
      email: input.email.trim(),
      documentRequirements: [...new Set(input.documentRequirements)],
      receivedDocuments: [...new Set(input.receivedDocuments)],
      updateReason: input.updateReason?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    }))
  }

  async createFromIntake(input: CreatePersonFromIntakeInput): Promise<PersonRecord> {
    const existing = await this.repository.findBySourceReference(input.sourceReference)
    if (existing) return existing

    const identifier = sanitizeCpf(input.identifier)
    if (!isValidCpf(identifier)) throw new Error('INVALID_CPF')

    return this.repository.create(this.recalculate({
      id: `person-whatsapp-${input.sourceReference}`,
      name: input.name,
      identifier,
      email: input.email,
      documentStatus: 'pending_document',
      documentCount: input.documentCount,
      missingDocuments: [],
      updatedAt: new Date().toISOString(),
      source: 'whatsapp',
      sourceReference: input.sourceReference,
      documentRequirements: ['identity', 'proof_of_residence'],
      receivedDocuments: [],
    }))
  }

  async createManual(input: CreateManualPersonInput): Promise<PersonRecord> {
    const name = input.name.trim()
    const identifier = sanitizeCpf(input.identifier)
    const email = input.email.trim()
    if (!name || !email) throw new Error('INVALID_PERSON')
    if (!isValidCpf(identifier)) throw new Error('INVALID_CPF')

    const normalizedIdentifier = identifier.toLocaleLowerCase('pt-BR')
    const normalizedEmail = email.toLocaleLowerCase('pt-BR')
    const existing = (await this.repository.findAll()).find((person) => (
      person.identifier.toLocaleLowerCase('pt-BR') === normalizedIdentifier
      || person.email.toLocaleLowerCase('pt-BR') === normalizedEmail
    ))
    if (existing) throw new Error('PERSON_ALREADY_EXISTS')

    return this.repository.create(this.recalculate({
      id: `person-manual-${crypto.randomUUID()}`,
      name,
      identifier,
      email,
      documentStatus: 'pending_document',
      documentCount: 0,
      missingDocuments: [],
      updatedAt: new Date().toISOString(),
      source: 'manual',
      documentRequirements: [...new Set(input.documentRequirements)],
      receivedDocuments: [],
    }))
  }

  async markDocumentReceived(id: string, category: DocumentCategory): Promise<PersonRecord> {
    const current = (await this.repository.findAll()).find((person) => person.id === id)
    if (!current) throw new Error('PERSON_NOT_FOUND')
    const receivedDocuments = [...new Set([...(current.receivedDocuments ?? []), category])]
    return this.repository.update(id, this.recalculate({
      ...current,
      receivedDocuments,
      updatedAt: new Date().toISOString(),
    }))
  }

  resetDemo(): Promise<PersonRecord[]> {
    return this.repository.reset()
  }

  private recalculate(person: PersonRecord): PersonRecord {
    const requirements = person.documentRequirements ?? []
    const received = person.receivedDocuments ?? []
    const missingCategories = requirements.filter((category) => !received.includes(category))
    const labels = new Map(DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]))
    return {
      ...person,
      documentRequirements: requirements,
      receivedDocuments: received,
      documentCount: received.length,
      missingDocuments: missingCategories.map((category) => labels.get(category) ?? category),
      documentStatus: missingCategories.length ? 'pending_document' : person.updateReason ? 'update_required' : 'complete',
    }
  }
}

export const personService = new PersonService()
