import type { PersonListFilters, PersonRecord } from '../types/person'

export interface PersonRepository {
  findAll(filters?: PersonListFilters): Promise<PersonRecord[]>
  create(person: PersonRecord): Promise<PersonRecord>
  update(id: string, person: PersonRecord): Promise<PersonRecord>
  findBySourceReference(reference: string): Promise<PersonRecord | null>
  reset(): Promise<PersonRecord[]>
}
