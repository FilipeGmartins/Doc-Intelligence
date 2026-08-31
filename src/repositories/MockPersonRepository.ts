import { MockPeopleDatabase, mockPeopleDatabase } from '../mocks/mockPeopleDatabase'
import type { PersonListFilters, PersonRecord } from '../types/person'
import type { PersonRepository } from './PersonRepository'

export class MockPersonRepository implements PersonRepository {
  private readonly database: MockPeopleDatabase

  constructor(database: MockPeopleDatabase = mockPeopleDatabase) {
    this.database = database
  }

  async findAll(filters: PersonListFilters = {}): Promise<PersonRecord[]> {
    const query = filters.query?.trim().toLocaleLowerCase('pt-BR')
    return this.database.read().filter((person) => {
      if (filters.status && person.documentStatus !== filters.status) return false
      if (!query) return true
      return [person.name, person.email, person.identifier]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
    })
  }

  async create(person: PersonRecord): Promise<PersonRecord> {
    this.database.write([person, ...this.database.read()])
    return structuredClone(person)
  }

  async update(id: string, person: PersonRecord): Promise<PersonRecord> {
    const people = this.database.read()
    const index = people.findIndex((item) => item.id === id)
    if (index < 0) throw new Error('PERSON_NOT_FOUND')
    const updated = { ...structuredClone(person), id }
    people[index] = updated
    this.database.write(people)
    return structuredClone(updated)
  }

  async findBySourceReference(reference: string): Promise<PersonRecord | null> {
    return this.database.read().find((person) => person.sourceReference === reference) ?? null
  }

  async reset(): Promise<PersonRecord[]> {
    return this.database.reset()
  }
}
