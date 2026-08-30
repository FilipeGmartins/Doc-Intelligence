import { useEffect, useState } from 'react'
import { documentService } from '../services/documentService'
import type { DocumentListFilters, DocumentRecord } from '../types/document'

export function useDocuments(filters: DocumentListFilters = {}) {
  const [documents, setDocuments] = useState<DocumentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const { query, status } = filters

  useEffect(() => {
    let active = true

    void documentService.list({ query, status }).then(
      (result) => {
        if (!active) return
        setDocuments(result)
        setError(null)
        setLoading(false)
      },
      () => {
        if (!active) return
        setError('Não foi possível carregar os documentos.')
        setLoading(false)
      },
    )

    return () => { active = false }
  }, [query, reloadVersion, status])

  const reload = () => {
    setLoading(true)
    setReloadVersion((version) => version + 1)
  }

  return { documents, loading, error, reload }
}
