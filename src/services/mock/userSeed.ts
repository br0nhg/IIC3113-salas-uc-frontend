import type { Favorite, HistoryEntry, Report } from '../../types'

/*
 * Datos iniciales de demostración para la cuenta de prueba estudiante@uc.cl.
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
    reports: [
      {
        id: 'r-seed-1',
        roomId: 'BC23',
        type: 'equipment',
        detail: 'Falla el cable HDMI de la mesa docente.',
        status: 'in-review',
        createdAt: ago(150),
      },
      {
        id: 'r-seed-2',
        roomId: 'K201',
        type: 'shown-free-but-busy',
        detail: 'Aparecía libre pero había un ensayo de la rama de teatro.',
        status: 'resolved',
        createdAt: ago(60 * 24 * 2),
      },
    ] satisfies Report[],
  },
}
