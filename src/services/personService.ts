import { mockPeople } from '../mocks/mockPeople'
import type { PersonListFilters, PersonRecord } from '../types/person'

export interface PersonServiceContract {
  list(filters?: PersonListFilters): Promise<PersonRecord[]>
}

export class PersonService implements PersonServiceContract {
  async list(filters: PersonListFilters = {}): Promise<PersonRecord[]> {
    const query = filters.query?.trim().toLocaleLowerCase('pt-BR')

    return structuredClone(mockPeople).filter((person) => {
      if (filters.status && person.documentStatus !== filters.status) return false
      if (!query) return true

      return [person.name, person.email, person.identifier]
        .some((value) => value.toLocaleLowerCase('pt-BR').includes(query))
    })
  }
}

export const personService = new PersonService()
