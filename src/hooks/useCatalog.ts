import { useEffect, useState } from 'react'
import { getBuildings, getDays, getModules } from '../services'
import type { Building, Day, TimeModule } from '../types'

/** Datos estáticos de referencia: edificios, días y módulos. */
export interface Catalog {
  buildings: Building[]
  days: Day[]
  modules: TimeModule[]
}

interface CatalogState {
  catalog: Catalog | null
  error: boolean
}

/** Carga el catálogo una vez (los servicios lo memorizan entre páginas). */
export function useCatalog(): CatalogState {
  const [state, setState] = useState<CatalogState>({ catalog: null, error: false })

  useEffect(() => {
    let cancelled = false
    Promise.all([getBuildings(), getDays(), getModules()])
      .then(([buildings, days, modules]) => {
        if (!cancelled) setState({ catalog: { buildings, days, modules }, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ catalog: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
