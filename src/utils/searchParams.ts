import type { BuildingCode, DayCode, ModuleNumber, SearchFilters } from '../types'

/*
 * Los filtros de búsqueda viven en la URL (/salas?sector=K&dia=L&modulo=4&q=k2&libres=1&vista=compacto)
 * para que se puedan compartir, volver con "atrás" y repetir desde el historial.
 * Sin dia ni modulo, la búsqueda usa el módulo "ahora".
 */

export const PARAM = {
  sector: 'sector',
  day: 'dia',
  module: 'modulo',
  query: 'q',
  onlyFree: 'libres',
  view: 'vista',
} as const

export type ViewMode = 'cards' | 'compact'

/** Lee los parámetros de la URL validándolos contra los valores permitidos. */
export function parseSearchParams(
  params: URLSearchParams,
  allowed: { buildings: BuildingCode[]; days: DayCode[]; modules: ModuleNumber[] },
) {
  const sector = params.get(PARAM.sector)
  const day = params.get(PARAM.day)
  const module = Number(params.get(PARAM.module))
  return {
    buildingCode: allowed.buildings.find((code) => code === sector),
    day: allowed.days.find((code) => code === day),
    module: allowed.modules.find((number) => number === module),
    query: params.get(PARAM.query) ?? '',
    onlyFree: params.get(PARAM.onlyFree) === '1',
    view: (params.get(PARAM.view) === 'compacto' ? 'compact' : 'cards') as ViewMode,
  }
}

/** URL de búsqueda para unos filtros guardados (ej. desde el historial). */
export function searchUrl(filters: SearchFilters): string {
  const params = new URLSearchParams()
  if (filters.buildingCode) params.set(PARAM.sector, filters.buildingCode)
  params.set(PARAM.day, filters.day)
  params.set(PARAM.module, String(filters.module))
  if (filters.query) params.set(PARAM.query, filters.query)
  if (filters.onlyFree) params.set(PARAM.onlyFree, '1')
  return `/salas?${params.toString()}`
}
