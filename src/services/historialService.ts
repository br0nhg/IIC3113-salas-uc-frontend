import type { HistoryEntry, HistoryEntryInput } from '../types'
import { USE_MOCK } from './config'
import { deleteJson, getJson, postJson } from './http'
import { currentUserId, mockId, readUserData, writeUserData } from './mock/userStore'
import { mockResponse } from './mock/utils'

/*
 * Historial de consultas del usuario con cuenta (los invitados no tienen).
 * Endpoints tentativos: GET /me/history, POST /me/history, DELETE /me/history.
 */

const KEY = 'history'
const MAX_ENTRIES = 30

function sameContent(a: HistoryEntryInput, b: HistoryEntryInput): boolean {
  if (a.type === 'room' && b.type === 'room') return a.roomId === b.roomId && a.day === b.day
  if (a.type === 'search' && b.type === 'search') {
    return JSON.stringify(a.filters) === JSON.stringify(b.filters)
  }
  return false
}

export function getHistory(): Promise<HistoryEntry[]> {
  if (USE_MOCK) {
    const userId = currentUserId()
    return mockResponse(userId ? readUserData<HistoryEntry[]>(userId, KEY, []) : [])
  }
  return getJson<HistoryEntry[]>('/me/history')
}

/** Registra una consulta. Para invitados no hace nada. */
export function addHistoryEntry(input: HistoryEntryInput): Promise<void> {
  if (USE_MOCK) {
    const userId = currentUserId()
    if (!userId) return mockResponse(undefined)
    const entries = readUserData<HistoryEntry[]>(userId, KEY, [])
    // Repetir la misma consulta solo actualiza la fecha.
    const rest = entries.filter((entry) => !sameContent(entry, input))
    const entry = { ...input, id: mockId('h'), createdAt: new Date().toISOString() } as HistoryEntry
    writeUserData(userId, KEY, [entry, ...rest].slice(0, MAX_ENTRIES))
    return mockResponse(undefined)
  }
  return postJson<void>('/me/history', input)
}

export function clearHistory(): Promise<void> {
  if (USE_MOCK) {
    const userId = currentUserId()
    if (userId) writeUserData(userId, KEY, [])
    return mockResponse(undefined)
  }
  return deleteJson('/me/history')
}
