import type {
  Availability,
  AvailabilityFilters,
  Building,
  BuildingCode,
  Day,
  Room,
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
import { mockResponse } from './mock/utils'

/*
 * Capa de acceso a datos. Los componentes solo usan estas funciones, así que
 * pasar de mock a la API real consiste en definir VITE_API_URL.
 *
 * Los endpoints de la API son tentativos y deben alinearse con el backend.
 */

export function getBuildings(): Promise<Building[]> {
  if (USE_MOCK) return mockResponse(MOCK_BUILDINGS)
  return getJson<Building[]>('/buildings')
}

export function getRooms(buildingCode?: BuildingCode): Promise<Room[]> {
  if (USE_MOCK) {
    return mockResponse(
      buildingCode ? MOCK_ROOMS.filter((room) => room.buildingCode === buildingCode) : MOCK_ROOMS,
    )
  }
  return getJson<Room[]>('/rooms', { building: buildingCode })
}

export function getDays(): Promise<Day[]> {
  if (USE_MOCK) return mockResponse(MOCK_DAYS)
  return getJson<Day[]>('/days')
}

export function getModules(): Promise<TimeModule[]> {
  if (USE_MOCK) return mockResponse(MOCK_MODULES)
  return getJson<TimeModule[]>('/modules')
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
