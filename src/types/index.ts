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
  features: RoomFeature[]
}

/** Equipamiento de una sala. */
export type RoomFeature = 'projector' | 'air-conditioning' | 'power-outlets' | 'whiteboard' | 'wifi'

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

/* ---------- Estado y detalle de salas ---------- */

/**
 * Estado de una sala en un día y módulo:
 * - free: libre.
 * - soon: ocupada, pero libre desde el módulo siguiente.
 * - busy: ocupada.
 * - nodata: no hay información de BuscaCursos para ese módulo.
 */
export type RoomStatus = 'free' | 'soon' | 'busy' | 'nodata'

/** Ocupación de una sala en un módulo del día. isFree es null si no hay datos. */
export interface ScheduleSlot {
  module: TimeModule
  isFree: boolean | null
  course: CourseOccupancy | null
}

/** Próximo cambio de estado de una sala dentro del mismo día. */
export interface StatusTransition {
  /** "busy-from": pasa a ocupada; "free-from": pasa a libre. */
  kind: 'busy-from' | 'free-from'
  module: TimeModule
}

/** Sala con su estado en el día y módulo consultados. */
export interface RoomSummary {
  room: Room
  building: Building
  status: RoomStatus
  /** Curso en el módulo consultado (solo si está ocupada). */
  course: CourseOccupancy | null
  /** null: el estado se mantiene el resto del día. */
  transition: StatusTransition | null
}

export interface RoomSummaryFilters {
  day: DayCode
  module: ModuleNumber
  buildingCode?: BuildingCode
}

/** Detalle de una sala con su cronograma de un día. */
export interface RoomDetail {
  room: Room
  building: Building
  day: DayCode
  schedule: ScheduleSlot[]
}

export interface SyncStatus {
  /** Fecha ISO de la última actualización de datos desde BuscaCursos. */
  lastSyncAt: string
}

/* ---------- Favoritos, historial y reportes ---------- */

export interface Favorite {
  roomId: string
  /** Fecha ISO. */
  createdAt: string
}

/** Filtros de la búsqueda de salas que se guardan en el historial. */
export interface SearchFilters {
  buildingCode?: BuildingCode
  day: DayCode
  module: ModuleNumber
  query?: string
  onlyFree?: boolean
}

export type HistoryEntry =
  | { id: string; createdAt: string; type: 'search'; filters: SearchFilters }
  | { id: string; createdAt: string; type: 'room'; roomId: string; day: DayCode }

/** Entrada de historial antes de que el servicio le asigne id y fecha. */
export type HistoryEntryInput =
  | { type: 'search'; filters: SearchFilters }
  | { type: 'room'; roomId: string; day: DayCode }

export type ReportType =
  | 'shown-free-but-busy'
  | 'shown-busy-but-free'
  | 'equipment'
  | 'locked'
  | 'other'

export type ReportStatus = 'pending' | 'in-review' | 'resolved'

export interface ReportInput {
  roomId: string
  type: ReportType
  detail: string
}

export interface Report extends ReportInput {
  id: string
  status: ReportStatus
  /** Fecha ISO. */
  createdAt: string
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
