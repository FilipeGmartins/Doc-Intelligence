import type { DocumentRecord } from '../types/document'
import { mockDocuments } from './mockDocuments'

const STORAGE_KEY = 'doc-intelligence:documents:v1'

function cloneDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  return structuredClone(documents)
}

export class MockDatabase {
  read(): DocumentRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY)

    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid mock database')
      return parsed as DocumentRecord[]
    } catch {
      return this.reset()
    }
  }

  write(documents: DocumentRecord[]): DocumentRecord[] {
    const snapshot = cloneDocuments(documents)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return snapshot
  }

  reset(): DocumentRecord[] {
    return this.write(mockDocuments)
  }
}

export const mockDatabase = new MockDatabase()
