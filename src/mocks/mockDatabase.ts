import type { DocumentRecord } from '../types/document'
import { mockDocuments } from './mockDocuments'
import { isCpfField, isRgField, isValidCpf, sanitizeCpf, sanitizeRg } from '../utils/personalIdentifiers'

const STORAGE_KEY = 'doc-intelligence:documents:v2'
const LEGACY_STORAGE_KEY = 'doc-intelligence:documents:v1'

function cloneDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  return structuredClone(documents)
}

function normalizeDocuments(documents: DocumentRecord[]): DocumentRecord[] {
  return documents.map((document) => {
    let identifiersChanged = false
    const extractedFields = document.extractedFields.map((field) => {
      if (isCpfField(field.key, field.label)) {
        const sanitized = sanitizeCpf(field.value)
        const value = isValidCpf(sanitized) ? sanitized : '86288366757'
        identifiersChanged ||= value !== field.value
        return { ...field, value, manuallyEdited: value !== field.value || field.manuallyEdited }
      }
      if (isRgField(field.key, field.label)) {
        const value = sanitizeRg(field.value)
        identifiersChanged ||= value !== field.value
        return { ...field, value, manuallyEdited: value !== field.value || field.manuallyEdited }
      }
      return field
    })
    const events = document.events ?? []
    const migrationEventId = `event-identifier-migration-${document.id}`
    return {
      ...document,
      previewUrl: undefined,
      extractedFields,
      events: identifiersChanged && !events.some((event) => event.id === migrationEventId)
        ? [...events, {
            id: migrationEventId,
            type: 'manually_edited',
            description: 'CPF e RG normalizados durante a migração dos dados locais.',
            actor: 'Migração local',
            createdAt: document.updatedAt,
          }]
        : events,
    }
  })
}

export class MockDatabase {
  read(): DocumentRecord[] {
    const stored = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY)

    if (!stored) return this.reset()

    try {
      const parsed: unknown = JSON.parse(stored)
      if (!Array.isArray(parsed)) throw new Error('Invalid mock database')
      const normalized = normalizeDocuments(parsed as DocumentRecord[])
      this.write(normalized)
      return normalized
    } catch {
      return this.reset()
    }
  }

  write(documents: DocumentRecord[]): DocumentRecord[] {
    const snapshot = cloneDocuments(documents).map((document) => ({ ...document, previewUrl: undefined }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return snapshot
  }

  reset(): DocumentRecord[] {
    return this.write(mockDocuments)
  }
}

export const mockDatabase = new MockDatabase()
