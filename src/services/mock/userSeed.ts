import type { Favorite, HistoryEntry } from '../../types'

/*
 * Datos iniciales de demostración para la cuenta de prueba estudiante@uc.cl
 * (sus reportes de demostración están en mock/reports.ts).
 * Solo se usan mientras el usuario no haya guardado datos propios.
 */

const MINUTE = 60_000
const ago = (minutes: number) => new Date(Date.now() - minutes * MINUTE).toISOString()

export const USER_SEED: Record<string, Record<string, unknown>> = {
  'u-estudiante': {
    favorites: [
      { roomId: 'K200', createdAt: ago(60 * 24 * 7) },
      { roomId: 'BC24', createdAt: ago(60 * 24 * 5) },
      { roomId: 'A2', createdAt: ago(60 * 24 * 2) },
    ] satisfies Favorite[],
    history: [
      {
        id: 'h-seed-1',
        createdAt: ago(45),
        type: 'search',
        filters: { buildingCode: 'K', day: 'L', module: 4, onlyFree: true },
      },
      { id: 'h-seed-2', createdAt: ago(60 * 20), type: 'room', roomId: 'B13', day: 'M' },
      {
        id: 'h-seed-3',
        createdAt: ago(60 * 22),
        type: 'search',
        filters: { buildingCode: 'BC', day: 'W', module: 2 },
      },
    ] satisfies HistoryEntry[],
  },
}
