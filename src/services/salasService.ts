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
import { getJson } from './http'
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
 * Las respuestas de la API (Sequelize) se adaptan aquí a los tipos del
 * frontend, para que los componentes no dependan del formato del backend.
 */

/** Edificios del alcance del MVP; el backend también entrega otros (ej. C). */
const MVP_BUILDINGS: readonly string[] = ['A', 'B', 'BC', 'K'] satisfies BuildingCode[]

function isMvpBuilding(code: string): code is BuildingCode {
  return MVP_BUILDINGS.includes(code)
}

interface ApiBuilding extends Building {
  id: number
}

interface ApiRoom {
  name: string
  buildingId: number
  capacity: number | null
  floor: number | null
}

/** "08:20:00" → "08:20". */
function toHourMinute(time: string): string {
  return time.slice(0, 5)
}

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

/** Edificios de la API (con su id interno), solo los del MVP. */
const getApiBuildings = cached(async (): Promise<ApiBuilding[]> => {
  const buildings = await getJson<ApiBuilding[]>('/buildings')
  return buildings.filter((building) => isMvpBuilding(building.code))
})

export const getBuildings = cached(async (): Promise<Building[]> => {
  if (USE_MOCK) return mockResponse(MOCK_BUILDINGS)
  const buildings = await getApiBuildings()
  return buildings.map(({ code, name, description }) => ({ code, name, description }))
})

export const getDays = cached(async (): Promise<Day[]> => {
  if (USE_MOCK) return mockResponse(MOCK_DAYS)
  const days = await getJson<Day[]>('/days')
  return days.map(({ code, name, shortName }) => ({ code, name, shortName }))
})

export const getModules = cached(async (): Promise<TimeModule[]> => {
  if (USE_MOCK) return mockResponse(MOCK_MODULES)
  const modules = await getJson<TimeModule[]>('/modules')
  return modules
    .map(({ number, start, end }) => ({ number, start: toHourMinute(start), end: toHourMinute(end) }))
    .sort((a, b) => a.number - b.number)
})

/** Salas (sin caché: el administrador puede editar piso y capacidad). */
export async function getRooms(buildingCode?: BuildingCode): Promise<Room[]> {
  if (USE_MOCK) {
    return mockResponse(
      buildingCode ? MOCK_ROOMS.filter((room) => room.buildingCode === buildingCode) : MOCK_ROOMS,
    )
  }
  const [buildings, apiRooms] = await Promise.all([getApiBuildings(), getJson<ApiRoom[]>('/rooms')])
  const codeById = new Map(buildings.map((building) => [building.id, building.code]))

  const rooms: Room[] = []
  for (const { name, buildingId, capacity, floor } of apiRooms) {
    const code = codeById.get(buildingId)
    if (!code || (buildingCode && code !== buildingCode)) continue
    // La API identifica las salas por su nombre de BuscaCursos (ej. "B12").
    rooms.push({ id: name, name, buildingCode: code, capacity, floor, features: [] })
  }
  return rooms
}

/** Una sala por id, o null si no existe. */
export async function getRoom(roomId: string): Promise<Room | null> {
  if (USE_MOCK) return mockResponse(MOCK_ROOMS.find((room) => room.id === roomId) ?? null)
  // La API no tiene GET /rooms/:id; son pocas salas, así que se busca en la lista.
  const rooms = await getRooms()
  return rooms.find((room) => room.id === roomId) ?? null
}

export async function getAvailability(filters: AvailabilityFilters = {}): Promise<Availability[]> {
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
  const availability = await getJson<Availability[]>('/availability', {
    building: filters.buildingCode,
    room: filters.roomId,
    day: filters.day,
    module: filters.module,
    onlyFree: filters.onlyFree,
  })
  return availability.filter((item) => isMvpBuilding(item.buildingCode))
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
