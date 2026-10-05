import type { DayCode, ModuleNumber, TimeModule } from '../types'

/** Día de BuscaCursos según Date.getDay() (0 = domingo, sin clases). */
const DAY_CODES_BY_JS_DAY: (DayCode | null)[] = [null, 'L', 'M', 'W', 'J', 'V', 'S']
const DAY_ORDER: DayCode[] = ['L', 'M', 'W', 'J', 'V', 'S']

/** Código del día actual, o null si es domingo. */
export function getTodayCode(now = new Date()): DayCode | null {
  return DAY_CODES_BY_JS_DAY[now.getDay()] ?? null
}

/** Hora actual en formato HH:mm, comparable con los horarios de los módulos. */
export function getTimeOfDay(now = new Date()): string {
  return now.toTimeString().slice(0, 5)
}

export interface CurrentSlot {
  day: DayCode
  module: ModuleNumber
  /** true si en este momento se está dictando ese módulo. */
  inProgress: boolean
}

/**
 * Módulo "ahora": el que está en curso o el próximo que empieza.
 * Después del último módulo (o en domingo) pasa al primer módulo del día siguiente.
 */
export function getCurrentSlot(modules: TimeModule[], now = new Date()): CurrentSlot | null {
  const first = modules[0]
  if (!first) return null

  const today = getTodayCode(now)
  const time = getTimeOfDay(now)
  const next = today ? modules.find((module) => time <= module.end) : undefined
  if (today && next) {
    return { day: today, module: next.number, inProgress: time >= next.start }
  }

  const nextDay = today ? DAY_ORDER[(DAY_ORDER.indexOf(today) + 1) % DAY_ORDER.length] : 'L'
  return { day: nextDay ?? 'L', module: first.number, inProgress: false }
}

/** Indica si un módulo de hoy ya terminó. */
export function isModulePast(module: TimeModule, day: DayCode, now = new Date()): boolean {
  return getTodayCode(now) === day && getTimeOfDay(now) > module.end
}

export function formatModuleRange(module: TimeModule): string {
  return `${module.start} – ${module.end}`
}

/** "hace 4 min", "hace 2 h", "hace 3 días". */
export function formatRelativeTime(iso: string, now = new Date()): string {
  const minutes = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60_000))
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.round(hours / 24)
  return `hace ${days} ${days === 1 ? 'día' : 'días'}`
}
