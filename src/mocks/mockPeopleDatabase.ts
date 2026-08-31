import type { PersonRecord } from '../types/person'
import { mockPeople } from './mockPeople'

const STORAGE_KEY = 'doc-intelligence:people:v1'

export class MockPeopleDatabase {
  read(): PersonRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid people database')
      return parsed as PersonRecord[]
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
