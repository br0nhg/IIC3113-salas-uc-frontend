/*
 * Lectura y escritura de JSON en localStorage / sessionStorage.
 * El almacenamiento puede no estar disponible (modo privado, bloqueado), así
 * que cualquier error se ignora y se devuelve el valor por defecto.
 */

type StorageKind = 'local' | 'session'

const PREFIX = 'salasuc:'

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return null
  }
}

export function readJson<T>(key: string, fallback: T, kind: StorageKind = 'local'): T {
  try {
    const raw = getStorage(kind)?.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown, kind: StorageKind = 'local'): void {
  try {
    getStorage(kind)?.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Sin almacenamiento disponible: el dato solo vive en memoria.
  }
}

export function removeKey(key: string, kind: StorageKind = 'local'): void {
  try {
    getStorage(kind)?.removeItem(PREFIX + key)
  } catch {
    // Ignorado.
  }
}
