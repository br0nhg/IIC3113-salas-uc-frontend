import type {
  AdminMetrics,
  AdminOfficialReservation,
  AdminReport,
  AdminReportFilter,
  AdminRoomRow,
  OfficialReservationsImportResult,
  OfficialReservationInput,
  ReportReview,
  Room,
  RoomSummaryFilters,
  ScraperStatus,
  SyncStatus,
} from '../types'
import { USE_MOCK } from './config'
import { ApiError, deleteJson, getJson, patchJson, postJson } from './http'
import { MOCK_ROOMS } from './mock/data'
import { readMockReports, toMockAdminReport, writeMockReports } from './mock/reports'
import { getMockLastSyncAt, markMockSynced } from './mock/sync'
import { mockError, mockResponse } from './mock/utils'
import { getRooms, getRoomSummaries, getSyncStatus } from './salasService'

/*
 * Consola de administración (requiere rol admin en la API).
 * Endpoints: POST/GET /scraper (sincronización), PATCH /admin/rooms/:id,
 * /admin/official-reservations, /admin/reports y /admin/metrics.
 */

const SYNC_POLL_MS = 5000


export async function getAdminMetrics(): Promise<AdminMetrics> {
  if (USE_MOCK) {
    return mockResponse({
      students: 128,
      newStudents: 14,
      favorites: 342,
      openReports: readMockReports().map(toMockAdminReport).filter((r) => r.status === 'pending').length,
      activeReportBlocks: readMockReports().filter((r) => r.status === 'accepted').length,
      upcomingReservations: 0,
      connectedRooms: MOCK_ROOMS.length,
    })
  }
  const [rooms, metrics] = await Promise.all([
    getRooms(),
    getJson<Omit<AdminMetrics, 'connectedRooms'>>('/admin/metrics'),
  ])
  return { ...metrics, connectedRooms: rooms.length }
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
    const { status } = await getJson<ScraperStatus>('/scraper')
    if (status === 'completed') return getSyncStatus()
    if (status !== 'running') throw new ApiError(500, 'La sincronización con BuscaCursos falló.')
  }
}

/** Estado y log del scraper (GET /scraper). */
export function getScraperStatus(): Promise<ScraperStatus> {
  if (USE_MOCK) {
    return mockResponse({
      status: 'completed',
      startedAt: getMockLastSyncAt(),
      finishedAt: getMockLastSyncAt(),
      exitCode: 0,
      log: ['Modo demostración: el scraper real corre en el servidor de la API.'],
    })
  }
  return getJson<ScraperStatus>('/scraper')
}

/** Inicia el scraper sin esperar a que termine. Si ya está corriendo, no hace nada. */
export async function startScraper(): Promise<void> {
  if (USE_MOCK) {
    markMockSynced()
    return mockResponse(undefined, 600)
  }
  await postJson('/scraper').catch((error: unknown) => {
    if (!(error instanceof ApiError && error.status === 409)) throw error
  })
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

/** Importa el JSON de reservas y reemplaza las semanas que aparecen en él. */
export function importOfficialReservations(data: unknown): Promise<OfficialReservationsImportResult> {
  if (USE_MOCK) {
    const rows = Array.isArray(data) ? data : []
    return mockResponse({
      importedSlots: rows.length,
      importedReservations: rows.length,
      replacedWeeks: [],
      unknownRooms: [],
    })
  }
  return postJson<OfficialReservationsImportResult>('/admin/official-reservations/import', data)
}

export function getOfficialReservations(from?: string): Promise<AdminOfficialReservation[]> {
  if (USE_MOCK) return mockResponse([])
  return getJson<AdminOfficialReservation[]>('/admin/official-reservations', { from })
}

export function updateOfficialReservation(
  id: string,
  input: OfficialReservationInput,
): Promise<AdminOfficialReservation> {
  if (USE_MOCK) {
    return mockResponse({
      id,
      roomName: input.sala,
      date: input.fecha,
      modules: [] as never[],
      reason: input.motivo,
    })
  }
  return patchJson<AdminOfficialReservation>(`/admin/official-reservations/${encodeURIComponent(id)}`, input)
}

export function deleteOfficialReservation(id: string): Promise<void> {
  if (USE_MOCK) return mockResponse(undefined)
  return deleteJson(`/admin/official-reservations/${encodeURIComponent(id)}`)
}

/* ---------- Reportes de ocupación ---------- */

/** Reportes para revisar. "pending" muestra solo los vigentes (su bloque no ha terminado). */
export function getAdminReports(filter: AdminReportFilter = 'pending'): Promise<AdminReport[]> {
  if (USE_MOCK) {
    const reports = readMockReports().map(toMockAdminReport)
    return mockResponse(filter === 'all' ? reports : reports.filter((r) => r.status === filter))
  }
  return getJson<AdminReport[]>('/admin/reports', { status: filter })
}

/** Acepta un reporte (la sala queda no disponible hasta el bloque indicado) o lo rechaza. */
export function reviewReport(id: string, review: ReportReview): Promise<AdminReport> {
  if (USE_MOCK) {
    const reports = readMockReports()
    const record = reports.find((r) => r.id === id)
    if (!record) return mockError(404, 'El reporte no existe.')
    if (
      review.action === 'accept' &&
      (review.untilDate < record.date || (review.untilDate === record.date && review.untilModule < record.module))
    ) {
      return mockError(400, 'El término no puede ser anterior al módulo reportado.')
    }
    Object.assign(record, {
      status: review.action === 'accept' ? 'accepted' : 'rejected',
      blockedUntil:
        review.action === 'accept' ? { date: review.untilDate, module: review.untilModule } : null,
      reviewedAt: new Date().toISOString(),
    })
    writeMockReports(reports)
    return mockResponse(toMockAdminReport(record))
  }
  return patchJson<AdminReport>(`/admin/reports/${encodeURIComponent(id)}`, review)
}
