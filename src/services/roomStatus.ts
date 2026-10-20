import type {
  Availability,
  ModuleNumber,
  RoomStatus,
  RoomSummary,
  ScheduleSlot,
  TimeModule,
} from '../types'

/*
 * Cálculo del estado de una sala a partir de su disponibilidad del día.
 * Es lógica pura: se aplica igual a los datos mock y a los de la API.
 */

/** Cronograma de una sala en un día; los módulos sin registro quedan sin datos. */
export function buildSchedule(modules: TimeModule[], availability: Availability[]): ScheduleSlot[] {
  return modules.map((module) => {
    const record = availability.find((item) => item.module === module.number)
    return {
      module,
      isFree: record ? record.isFree : null,
      course: record?.course ?? null,
    }
  })
}

/** Estado, curso y próximo cambio de una sala en el módulo indicado. */
export function summarizeSchedule(
  schedule: ScheduleSlot[],
  module: ModuleNumber,
): Pick<RoomSummary, 'status' | 'course' | 'transition'> {
  const index = schedule.findIndex((slot) => slot.module.number === module)
  const slot = schedule[index]
  if (!slot || slot.isFree === null) return { status: 'nodata', course: null, transition: null }

  const later = schedule.slice(index + 1)
  if (slot.isFree) {
    const nextBusy = later.find((s) => s.isFree === false)
    return {
      status: 'free',
      course: null,
      transition: nextBusy ? { kind: 'busy-from', module: nextBusy.module } : null,
    }
  }

  const nextFree = later.find((s) => s.isFree === true)
  return {
    status: later[0]?.isFree === true ? 'soon' : 'busy',
    course: slot.course,
    transition: nextFree ? { kind: 'free-from', module: nextFree.module } : null,
  }
}

const STATUS_ORDER: Record<RoomStatus, number> = { free: 0, soon: 1, busy: 2, nodata: 3 }

/** Ordena primero las salas libres y luego por nombre (B12 antes que B21). */
export function compareSummaries(a: RoomSummary, b: RoomSummary): number {
  return (
    STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
    a.room.name.localeCompare(b.room.name, 'es', { numeric: true })
  )
}
