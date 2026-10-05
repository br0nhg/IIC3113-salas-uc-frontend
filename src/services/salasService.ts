import type {
  Availability,
  AvailabilityFilters,
  Building,
  BuildingCode,
  Day,
  DayCode,
  Room,
  RoomDetail,
  RoomSummary,
  RoomSummaryFilters,
  SyncStatus,
  TimeModule,
} from '../types'
import { USE_MOCK } from './config'
import { ApiError, getJson } from './http'
import {
  MOCK_AVAILABILITY,
  MOCK_BUILDINGS,
  MOCK_DAYS,
  MOCK_MODULES,
  MOCK_ROOMS,
} from './mock/data'
import { getMockLastSyncAt } from './mock/sync'
import { mockResponse } from './mock/utils'
import { buildSchedule, compareSummaries, summarizeSchedule } from './roomStatus'

/*
 * Capa de acceso a datos. Los componentes solo usan estas funciones, así que
 * pasar de mock a la API real consiste en definir VITE_API_URL.
 *
 * Los endpoints de la API son tentativos y deben alinearse con el backend.
 */

/** Memoriza datos que no cambian durante la sesión; si la carga falla, se reintenta. */
function cached<T>(load: () => Promise<T>): () => Promise<T> {
  let promise: Promise<T> | null = null
  return () => {
    promise ??= load().catch((error: unknown) => {
      promise = null
      throw error
    })
    return promise
  }
}

export const getBuildings = cached((): Promise<Building[]> => {
  if (USE_MOCK) return mockResponse(MOCK_BUILDINGS)
  return getJson<Building[]>('/buildings')
})

export const getDays = cached((): Promise<Day[]> => {
  if (USE_MOCK) return mockResponse(MOCK_DAYS)
  return getJson<Day[]>('/days')
})

export const getModules = cached((): Promise<TimeModule[]> => {
  if (USE_MOCK) return mockResponse(MOCK_MODULES)
  return getJson<TimeModule[]>('/modules')
})

export function getRooms(buildingCode?: BuildingCode): Promise<Room[]> {
  if (USE_MOCK) {
    return mockResponse(
      buildingCode ? MOCK_ROOMS.filter((room) => room.buildingCode === buildingCode) : MOCK_ROOMS,
    )
  }
  return getJson<Room[]>('/rooms', { building: buildingCode })
}

/** Una sala por id, o null si no existe. */
export async function getRoom(roomId: string): Promise<Room | null> {
  if (USE_MOCK) return mockResponse(MOCK_ROOMS.find((room) => room.id === roomId) ?? null)
  try {
    return await getJson<Room>(`/rooms/${encodeURIComponent(roomId)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

export function getAvailability(filters: AvailabilityFilters = {}): Promise<Availability[]> {
  if (USE_MOCK) {
    const { buildingCode, roomId, day, module, onlyFree } = filters
    return mockResponse(
      MOCK_AVAILABILITY.filter(
        (item) =>
          (buildingCode === undefined || item.buildingCode === buildingCode) &&
          (roomId === undefined || item.roomId === roomId) &&
          (day === undefined || item.day === day) &&
          (module === undefined || item.module === module) &&
          (!onlyFree || item.isFree),
      ),
    )
  }
  return getJson<Availability[]>('/availability', {
    building: filters.buildingCode,
    room: filters.roomId,
    day: filters.day,
    module: filters.module,
    onlyFree: filters.onlyFree,
  })
}

/** Salas con su estado en un día y módulo, ordenadas (libres primero). */
export async function getRoomSummaries(filters: RoomSummaryFilters): Promise<RoomSummary[]> {
  const [buildings, rooms, modules, availability] = await Promise.all([
    getBuildings(),
    getRooms(filters.buildingCode),
    getModules(),
    getAvailability({ day: filters.day, buildingCode: filters.buildingCode }),
  ])

  const summaries: RoomSummary[] = []
  for (const room of rooms) {
    const building = buildings.find((b) => b.code === room.buildingCode)
    if (!building) continue
    const schedule = buildSchedule(
      modules,
      availability.filter((item) => item.roomId === room.id),
    )
    summaries.push({ room, building, ...summarizeSchedule(schedule, filters.module) })
  }
  return summaries.sort(compareSummaries)
}

/** Detalle de una sala con su cronograma del día, o null si no existe. */
export async function getRoomDetail(roomId: string, day: DayCode): Promise<RoomDetail | null> {
  const [room, buildings, modules, availability] = await Promise.all([
    getRoom(roomId),
    getBuildings(),
    getModules(),
    getAvailability({ roomId, day }),
  ])
  const building = room && buildings.find((b) => b.code === room.buildingCode)
  if (!room || !building) return null
  return { room, building, day, schedule: buildSchedule(modules, availability) }
}

/** Fecha de la última actualización de datos desde BuscaCursos. */
export function getSyncStatus(): Promise<SyncStatus> {
  if (USE_MOCK) return mockResponse({ lastSyncAt: getMockLastSyncAt() })
  return getJson<SyncStatus>('/sync/status')
}
