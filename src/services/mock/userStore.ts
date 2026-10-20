import { getStoredSession } from '../authService'
import { readJson, writeJson } from '../storage'
import { USER_SEED } from './userSeed'

/*
 * Datos mock por usuario (favoritos, historial, reportes) guardados en
 * localStorage bajo una clave que incluye el id del usuario de la sesión.
 */

/** Id del usuario con cuenta en sesión; null para invitados o sin sesión. */
export function currentUserId(): string | null {
  const user = getStoredSession()?.user
  return user && user.role !== 'guest' ? user.id : null
}

/** Datos guardados del usuario; si nunca guardó, los de demostración o el valor por defecto. */
export function readUserData<T>(userId: string, key: string, fallback: T): T {
  const seed = USER_SEED[userId]?.[key] as T | undefined
  return readJson<T>(`${key}:${userId}`, seed ?? fallback)
}

export function writeUserData(userId: string, key: string, value: unknown): void {
  writeJson(`${key}:${userId}`, value)
}

let idCounter = 0

/** Id único para registros mock. */
export function mockId(prefix: string): string {
  idCounter += 1
  return `${prefix}-${Date.now().toString(36)}-${idCounter}`
}
