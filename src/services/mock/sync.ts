/** Última actualización simulada desde BuscaCursos: hace 4 minutos al cargar la app. */
let lastSyncAt = new Date(Date.now() - 4 * 60_000).toISOString()

export function getMockLastSyncAt(): string {
  return lastSyncAt
}

/** Simula una sincronización completada ahora. */
export function markMockSynced(): string {
  lastSyncAt = new Date().toISOString()
  return lastSyncAt
}
