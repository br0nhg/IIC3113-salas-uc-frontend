import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { BuildingCode, DayCode, ModuleNumber } from '../types'
import { getCurrentSlot } from '../utils/schedule'
import { PARAM, parseSearchParams, type ViewMode } from '../utils/searchParams'
import type { Catalog } from './useCatalog'

export interface FiltersPatch {
  buildingCode?: BuildingCode | null
  day?: DayCode
  module?: ModuleNumber
  query?: string
  onlyFree?: boolean
  view?: ViewMode
}

/** Filtros de la búsqueda de salas sincronizados con la URL. */
export function useSearchFilters(catalog: Catalog) {
  const [params, setParams] = useSearchParams()
  const parsed = parseSearchParams(params, {
    buildings: catalog.buildings.map((b) => b.code),
    days: catalog.days.map((d) => d.code),
    modules: catalog.modules.map((m) => m.number),
  })
  const now = getCurrentSlot(catalog.modules)

  const day = parsed.day ?? now?.day ?? 'L'
  const module = parsed.module ?? now?.module ?? 1
  const isNow = !parsed.day && !parsed.module

  const update = useCallback(
    (patch: FiltersPatch) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const set = (key: string, value: string | null | undefined) => {
            if (value) next.set(key, value)
            else next.delete(key)
          }
          if (patch.buildingCode !== undefined) set(PARAM.sector, patch.buildingCode)
          if (patch.query !== undefined) set(PARAM.query, patch.query.trim() ? patch.query : null)
          if (patch.onlyFree !== undefined) set(PARAM.onlyFree, patch.onlyFree ? '1' : null)
          if (patch.view !== undefined) set(PARAM.view, patch.view === 'compact' ? 'compacto' : null)
          // Al fijar día o módulo se fijan ambos, para que la búsqueda deje de seguir al "ahora".
          if (patch.day !== undefined || patch.module !== undefined) {
            next.set(PARAM.day, patch.day ?? day)
            next.set(PARAM.module, String(patch.module ?? module))
          }
          return next
        },
        { replace: true },
      )
    },
    [setParams, day, module],
  )

  const resetToNow = useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.delete(PARAM.day)
        next.delete(PARAM.module)
        return next
      },
      { replace: true },
    )
  }, [setParams])

  const clearFilters = useCallback(() => {
    setParams((prev) => {
      const next = new URLSearchParams()
      const view = prev.get(PARAM.view)
      if (view) next.set(PARAM.view, view)
      return next
    }, { replace: true })
  }, [setParams])

  /** true si el usuario aplicó algún filtro (no solo la vista por defecto). */
  const hasExplicitFilters = [PARAM.sector, PARAM.day, PARAM.module, PARAM.query, PARAM.onlyFree].some(
    (key) => params.has(key),
  )

  return {
    filters: { ...parsed, day, module },
    now,
    isNow,
    hasExplicitFilters,
    update,
    resetToNow,
    clearFilters,
  }
}
