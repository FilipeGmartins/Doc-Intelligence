import { DOCUMENT_CATEGORY_OPTIONS } from '../types/document'
import type { PersonRecord } from '../types/person'
import { mockPeople } from './mockPeople'

const STORAGE_KEY = 'doc-intelligence:people:v1'
const LEGACY_STORAGE_KEY = 'doc-intelligence-people-v1'

export class MockPeopleDatabase {
  private normalize(people: PersonRecord[]): PersonRecord[] {
    const labels = new Map(DOCUMENT_CATEGORY_OPTIONS.map((option) => [option.value, option.label]))
    return people.map((person) => {
      const documentRequirements = person.documentRequirements ?? []
      const receivedDocuments = person.receivedDocuments ?? documentRequirements.filter((category) => !person.missingDocuments.includes(labels.get(category) ?? category))
      return { ...person, documentRequirements, receivedDocuments }
    })
  }

  read(): PersonRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)
    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid people database')
      const normalized = this.normalize(parsed as PersonRecord[])
      this.write(normalized)
      return normalized
    } catch {
      return this.reset()
    }
  }

  write(people: PersonRecord[]): PersonRecord[] {
    const snapshot = structuredClone(people)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return snapshot
  }

  reset(): PersonRecord[] {
    return this.write(mockPeople)
  }
}

export const mockPeopleDatabase = new MockPeopleDatabase()
