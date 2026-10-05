import type { Favorite } from '../types'
import { USE_MOCK } from './config'
import { deleteJson, getJson, postJson } from './http'
import { currentUserId, readUserData, writeUserData } from './mock/userStore'
import { mockError, mockResponse } from './mock/utils'

/*
 * Salas favoritas del usuario con cuenta. Endpoints tentativos:
 * GET /me/favorites, POST /me/favorites { roomId }, DELETE /me/favorites/:roomId.
 */

const KEY = 'favorites'
const LOGIN_REQUIRED = 'Inicia sesión con tu cuenta UC para guardar favoritos.'

export function getFavorites(): Promise<Favorite[]> {
  if (USE_MOCK) {
    const userId = currentUserId()
    return mockResponse(userId ? readUserData<Favorite[]>(userId, KEY, []) : [])
  }
  return getJson<Favorite[]>('/me/favorites')
}

export function addFavorite(roomId: string): Promise<Favorite> {
  if (USE_MOCK) {
    const userId = currentUserId()
    if (!userId) return mockError(401, LOGIN_REQUIRED)
    const favorites = readUserData<Favorite[]>(userId, KEY, [])
    const existing = favorites.find((f) => f.roomId === roomId)
    if (existing) return mockResponse(existing)
    const favorite: Favorite = { roomId, createdAt: new Date().toISOString() }
    writeUserData(userId, KEY, [favorite, ...favorites])
    return mockResponse(favorite)
  }
  return postJson<Favorite>('/me/favorites', { roomId })
}

export function removeFavorite(roomId: string): Promise<void> {
  if (USE_MOCK) {
    const userId = currentUserId()
    if (!userId) return mockError(401, LOGIN_REQUIRED)
    const favorites = readUserData<Favorite[]>(userId, KEY, [])
    writeUserData(
      userId,
      KEY,
      favorites.filter((f) => f.roomId !== roomId),
    )
    return mockResponse(undefined)
  }
  return deleteJson(`/me/favorites/${encodeURIComponent(roomId)}`)
}
