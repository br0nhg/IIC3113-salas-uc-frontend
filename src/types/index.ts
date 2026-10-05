/** Códigos de los edificios / sectores de Ingeniería incluidos en el MVP. */
export type BuildingCode = 'A' | 'B' | 'BC' | 'K'

export interface Building {
  code: BuildingCode
  name: string
  description: string
}

export interface Room {
  /** Identificador único, igual al nombre que usa BuscaCursos (ej. "B12"). */
  id: string
  name: string
  buildingCode: BuildingCode
  capacity: number
  floor: number
}

/** Códigos de día tal como aparecen en BuscaCursos (W = miércoles). */
export type DayCode = 'L' | 'M' | 'W' | 'J' | 'V' | 'S'

export interface Day {
  code: DayCode
  name: string
  shortName: string
}

/** Número de módulo horario UC (1 a 9). */
export type ModuleNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export interface TimeModule {
  number: ModuleNumber
  /** Hora de inicio en formato HH:mm. */
  start: string
  /** Hora de término en formato HH:mm. */
  end: string
}

/** Curso que ocupa una sala en un día y módulo. */
export interface CourseOccupancy {
  code: string
  section: number
  name: string
}

/** Estado de una sala en un día y módulo específicos. */
export interface Availability {
  roomId: string
  buildingCode: BuildingCode
  day: DayCode
  module: ModuleNumber
  isFree: boolean
  /** Presente solo cuando la sala está ocupada. */
  course: CourseOccupancy | null
}

/** Filtros opcionales para consultar disponibilidad. */
export interface AvailabilityFilters {
  buildingCode?: BuildingCode
  roomId?: string
  day?: DayCode
  module?: ModuleNumber
  onlyFree?: boolean
}

/* ---------- Autenticación ---------- */

export type UserRole = 'guest' | 'student' | 'admin'

export interface User {
  id: string
  name: string
  /** Correo institucional; null para invitados. */
  email: string | null
  role: UserRole
}

export interface AuthSession {
  user: User
  /** Token de acceso que entrega la API (en mock es un valor simulado). */
  token: string
}

export interface LoginInput {
  email: string
  password: string
  /** Mantener la sesión al cerrar el navegador. */
  remember: boolean
}

export interface RegisterInput {
  name: string
  email: string
  password: string
}
