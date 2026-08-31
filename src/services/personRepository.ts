import { mockPeople } from '../mocks/mockPeople'
import { DOCUMENT_CATEGORY_OPTIONS } from '../types/document'
import type { PersonRecord } from '../types/person'

const STORAGE_KEY = 'doc-intelligence-people-v1'

export interface PersonRepository {
  list(): PersonRecord[]
  save(person: PersonRecord): PersonRecord
}

export class LocalPersonRepository implements PersonRepository {
  private normalize(people: PersonRecord[]): PersonRecord[] {
    const labels = new Map(DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]))
    return people.map((person) => {
      const requirements = person.documentRequirements ?? []
      const receivedDocuments = person.receivedDocuments ?? requirements.filter((category) => !person.missingDocuments.includes(labels.get(category) ?? category))
      return { ...person, documentRequirements: requirements, receivedDocuments }
    })
  }

  private read(): PersonRecord[] {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const initial = structuredClone(mockPeople)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }

    try {
      const normalized = this.normalize(JSON.parse(stored) as PersonRecord[])
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized))
      return normalized
    } catch {
      const initial = structuredClone(mockPeople)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
      return initial
    }
  }

  list(): PersonRecord[] {
    return structuredClone(this.read())
  }

  save(person: PersonRecord): PersonRecord {
    const people = this.read()
    const index = people.findIndex((item) => item.id === person.id)
    if (index < 0) throw new Error('Pessoa não encontrada.')
    people[index] = structuredClone(person)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(people))
    return structuredClone(person)
  }
}
