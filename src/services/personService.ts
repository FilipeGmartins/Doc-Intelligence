import { DOCUMENT_CATEGORY_OPTIONS } from '../types/document'
import type { PersonListFilters, PersonRecord, UpdatePersonInput } from '../types/person'
import { LocalPersonRepository, type PersonRepository } from './personRepository'

export interface PersonServiceContract {
  list(filters?: PersonListFilters): Promise<PersonRecord[]>
  update(id: string, input: UpdatePersonInput): Promise<PersonRecord>
}

export class PersonService implements PersonServiceContract {
  private readonly repository: PersonRepository

  constructor(repository: PersonRepository = new LocalPersonRepository()) {
    this.repository = repository
  }

  async list(filters: PersonListFilters = {}): Promise<PersonRecord[]> {
    const query = filters.query?.trim().toLocaleLowerCase('pt-BR')

    return this.repository.list().filter((person) => {
      if (filters.status && person.documentStatus !== filters.status) return false
      if (!query) return true

      return [person.name, person.email, person.identifier]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
    })
  }

  async update(id: string, input: UpdatePersonInput): Promise<PersonRecord> {
    const current = this.repository.list().find((person) => person.id === id)
    if (!current) throw new Error('Pessoa não encontrada.')

    const requirements = [...new Set(input.documentRequirements)]
    const received = [...new Set(input.receivedDocuments)]
    const missingCategories = requirements.filter((category) => !received.includes(category))
    const labels = new Map(DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]))
    const updateReason = input.updateReason?.trim() || undefined

    return this.repository.save({
      ...current,
      name: input.name.trim(),
      identifier: input.identifier.trim(),
      email: input.email.trim(),
      documentRequirements: requirements,
      receivedDocuments: received,
      documentCount: received.length,
      missingDocuments: missingCategories.map((category) => labels.get(category) ?? category),
      documentStatus: missingCategories.length ? 'pending_document' : updateReason ? 'update_required' : 'complete',
      updateReason,
      updatedAt: new Date().toISOString(),
    })
  }
}

export const personService = new PersonService()
