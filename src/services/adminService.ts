import type { AdminMetrics, AdminRoomRow, Room, RoomSummaryFilters, SyncStatus } from '../types'
import { USE_MOCK } from './config'
import { ApiError, getJson, patchJson, postJson } from './http'
import { MOCK_ROOMS } from './mock/data'
import { getMockLastSyncAt, markMockSynced } from './mock/sync'
import { mockResponse } from './mock/utils'
import { getRooms, getRoomSummaries, getSyncStatus } from './salasService'

/*
 * Consola de administración (requiere rol admin en la API).
 * La API aún no registra métricas de uso: solo se informa la cantidad de salas.
 * Endpoints: POST/GET /scraper (sincronización) y PATCH /admin/rooms/:id.
 */

const SYNC_POLL_MS = 5000

interface ScraperState {
  status: 'idle' | 'running' | 'completed' | 'failed'
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
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
  const rooms = await getRooms()
  return {
    weeklyActiveUsers: 0,
    weeklyActiveUsersChange: 0,
    queriesToday: 0,
    peakModules: [],
    retentionRate: 0,
    connectedRooms: rooms.length,
    openReports: 0,
  }
}

/** Todas las salas con su estado en el día y módulo indicados, ordenadas por nombre. */
export async function getAdminRooms(filters: RoomSummaryFilters): Promise<AdminRoomRow[]> {
  const [summaries, lastSyncAt] = await Promise.all([
    getRoomSummaries(filters),
    USE_MOCK ? getMockLastSyncAt() : getSyncStatus().then((status) => status.lastSyncAt),
  ])
  return summaries
    .map((summary) => ({ ...summary, lastSyncAt }))
    .sort((a, b) => a.room.name.localeCompare(b.room.name, 'es', { numeric: true }))
}

/** Fuerza una actualización de datos desde BuscaCursos. */
export function triggerSync(): Promise<SyncStatus> {
  if (USE_MOCK) {
    // El scraping real tarda; se simula con más latencia.
    return new Promise((resolve) => setTimeout(() => resolve({ lastSyncAt: markMockSynced() }), 1200))
  }
  return runScraper()
}

/** Lanza el scraper de BuscaCursos y espera a que termine (puede tardar varios minutos). */
async function runScraper(): Promise<SyncStatus> {
  await postJson('/scraper').catch((error: unknown) => {
    // 409: ya hay una sincronización en curso; se espera a que termine.
    if (!(error instanceof ApiError && error.status === 409)) throw error
  })
  for (;;) {
    await new Promise((resolve) => setTimeout(resolve, SYNC_POLL_MS))
    const { status } = await getJson<ScraperState>('/scraper')
    if (status === 'completed') return getSyncStatus()
    if (status !== 'running') throw new ApiError(500, 'La sincronización con BuscaCursos falló.')
  }
}

/** Piso y capacidad de una sala; no vienen de BuscaCursos y los ingresa el administrador. */
export async function updateRoomInfo(
  roomId: string,
  info: Pick<Room, 'capacity' | 'floor'>,
): Promise<void> {
  if (USE_MOCK) {
    const room = MOCK_ROOMS.find((r) => r.id === roomId)
    if (room) Object.assign(room, info)
    return mockResponse(undefined)
  }
  await patchJson(`/admin/rooms/${encodeURIComponent(roomId)}`, info)
}
