import type { AdminMetrics, AdminRoomRow, RoomSummaryFilters, SyncStatus } from '../types'
import { USE_MOCK } from './config'
import { getJson, postJson } from './http'
import { MOCK_ROOMS } from './mock/data'
import { getMockLastSyncAt, markMockSynced } from './mock/sync'
import { mockResponse } from './mock/utils'
import { getRoomSummaries } from './salasService'

/*
 * Consola de administración (requiere rol admin en la API).
 * Endpoints tentativos: GET /admin/metrics, GET /admin/rooms, POST /admin/sync.
 */

export function getAdminMetrics(): Promise<AdminMetrics> {
  if (USE_MOCK) {
    return mockResponse({
      weeklyActiveUsers: 4820,
      weeklyActiveUsersChange: 14.2,
      queriesToday: 14210,
      peakModules: [3, 4],
      retentionRate: 78,
      connectedRooms: MOCK_ROOMS.length,
      openReports: 3,
    })
  }
  return getJson<AdminMetrics>('/admin/metrics')
}

/** Todas las salas con su estado en el día y módulo indicados, ordenadas por nombre. */
export async function getAdminRooms(filters: RoomSummaryFilters): Promise<AdminRoomRow[]> {
  if (USE_MOCK) {
    const summaries = await getRoomSummaries(filters)
    const lastSyncAt = getMockLastSyncAt()
    return summaries
      .map((summary) => ({ ...summary, lastSyncAt }))
      .sort((a, b) => a.room.name.localeCompare(b.room.name, 'es', { numeric: true }))
  }
  return getJson<AdminRoomRow[]>('/admin/rooms', {
    day: filters.day,
    module: filters.module,
    building: filters.buildingCode,
  })
}

/** Fuerza una actualización de datos desde BuscaCursos. */
export function triggerSync(): Promise<SyncStatus> {
  if (USE_MOCK) {
    // El scraping real tarda; se simula con más latencia.
    return new Promise((resolve) => setTimeout(() => resolve({ lastSyncAt: markMockSynced() }), 1200))
  }
  return postJson<SyncStatus>('/admin/sync')
}
