import { MockPersonRepository } from '../repositories/MockPersonRepository'
import type { PersonRepository } from '../repositories/PersonRepository'
import type { CreatePersonFromIntakeInput, PersonListFilters, PersonRecord } from '../types/person'

export interface PersonServiceContract {
  list(filters?: PersonListFilters): Promise<PersonRecord[]>
  createFromIntake(input: CreatePersonFromIntakeInput): Promise<PersonRecord>
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

  async createFromIntake(input: CreatePersonFromIntakeInput): Promise<PersonRecord> {
    const existing = await this.repository.findBySourceReference(input.sourceReference)
    if (existing) return existing

    return this.repository.create({
      id: `person-whatsapp-${input.sourceReference}`,
      name: input.name,
      identifier: input.identifier,
      email: input.email,
      documentStatus: 'pending_document',
      documentCount: input.documentCount,
      missingDocuments: ['Comprovante de residência'],
      updatedAt: new Date().toISOString(),
      source: 'whatsapp',
      sourceReference: input.sourceReference,
    })
  }

  resetDemo(): Promise<PersonRecord[]> {
    return this.repository.reset()
  }
}

export const personService = new PersonService()
