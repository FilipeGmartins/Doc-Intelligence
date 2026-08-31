import { useEffect, useState } from 'react'
import { personService } from '../services/personService'
import type { PersonListFilters, PersonRecord } from '../types/person'
import type { UpdatePersonInput } from '../types/person'

export function usePeople(filters: PersonListFilters = {}) {
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadVersion, setReloadVersion] = useState(0)
  const { query, status } = filters

  useEffect(() => {
    let active = true

    void personService.list({ query, status }).then(
      (result) => {
        if (!active) return
        setPeople(result)
        setError(null)
        setLoading(false)
      },
      () => {
        if (!active) return
        setError('Não foi possível carregar as pessoas cadastradas.')
        setLoading(false)
      },
    )

    return () => { active = false }
  }, [query, reloadVersion, status])

  return {
    people,
    loading,
    error,
    reload: () => setReloadVersion((version) => version + 1),
    update: (id: string, input: UpdatePersonInput) => personService.update(id, input),
  }
}
