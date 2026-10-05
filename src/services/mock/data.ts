import type {
  Availability,
  Building,
  CourseOccupancy,
  Day,
  Room,
  RoomFeature,
  TimeModule,
} from '../../types'

/** Hash determinista para que los datos mock sean estables entre recargas. */
function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export const MOCK_BUILDINGS: Building[] = [
  { code: 'A', name: 'Edificio A', description: 'Sector A de Ingeniería, San Joaquín' },
  { code: 'B', name: 'Edificio B', description: 'Sector B de Ingeniería, San Joaquín' },
  { code: 'BC', name: 'Edificio BC', description: 'Sector BC de Ingeniería, San Joaquín' },
  { code: 'K', name: 'Edificio K', description: 'Sector K de Ingeniería, San Joaquín' },
]

const BASE_ROOMS: Omit<Room, 'features'>[] = [
  { id: 'A1', name: 'A1', buildingCode: 'A', capacity: 60, floor: 1 },
  { id: 'A2', name: 'A2', buildingCode: 'A', capacity: 60, floor: 1 },
  { id: 'A3', name: 'A3', buildingCode: 'A', capacity: 45, floor: 1 },
  { id: 'A5', name: 'A5', buildingCode: 'A', capacity: 80, floor: 2 },
  { id: 'A6', name: 'A6', buildingCode: 'A', capacity: 80, floor: 2 },
  { id: 'B12', name: 'B12', buildingCode: 'B', capacity: 40, floor: 1 },
  { id: 'B13', name: 'B13', buildingCode: 'B', capacity: 40, floor: 1 },
  { id: 'B14', name: 'B14', buildingCode: 'B', capacity: 50, floor: 1 },
  { id: 'B15', name: 'B15', buildingCode: 'B', capacity: 50, floor: 1 },
  { id: 'B21', name: 'B21', buildingCode: 'B', capacity: 35, floor: 2 },
  { id: 'B23', name: 'B23', buildingCode: 'B', capacity: 35, floor: 2 },
  { id: 'BC23', name: 'BC23', buildingCode: 'BC', capacity: 90, floor: 2 },
  { id: 'BC24', name: 'BC24', buildingCode: 'BC', capacity: 90, floor: 2 },
  { id: 'BC25', name: 'BC25', buildingCode: 'BC', capacity: 120, floor: 2 },
  { id: 'BC26', name: 'BC26', buildingCode: 'BC', capacity: 70, floor: 2 },
  { id: 'K200', name: 'K200', buildingCode: 'K', capacity: 100, floor: 2 },
  { id: 'K201', name: 'K201', buildingCode: 'K', capacity: 55, floor: 2 },
  { id: 'K202', name: 'K202', buildingCode: 'K', capacity: 55, floor: 2 },
  { id: 'K203', name: 'K203', buildingCode: 'K', capacity: 40, floor: 2 },
  { id: 'K204', name: 'K204', buildingCode: 'K', capacity: 40, floor: 2 },
]

/** Equipamiento mock: todas tienen proyector y wifi; el resto varía por sala. */
function featuresFor(roomId: string): RoomFeature[] {
  const h = hash(`features-${roomId}`)
  const features: RoomFeature[] = ['projector', 'wifi']
  if (h % 2 === 0) features.push('air-conditioning')
  if (h % 3 !== 0) features.push('power-outlets')
  if (h % 5 !== 0) features.push('whiteboard')
  return features
}

export const MOCK_ROOMS: Room[] = BASE_ROOMS.map((room) => ({
  ...room,
  features: featuresFor(room.id),
}))

export const MOCK_DAYS: Day[] = [
  { code: 'L', name: 'Lunes', shortName: 'Lun' },
  { code: 'M', name: 'Martes', shortName: 'Mar' },
  { code: 'W', name: 'Miércoles', shortName: 'Mié' },
  { code: 'J', name: 'Jueves', shortName: 'Jue' },
  { code: 'V', name: 'Viernes', shortName: 'Vie' },
  { code: 'S', name: 'Sábado', shortName: 'Sáb' },
]

export const MOCK_MODULES: TimeModule[] = [
  { number: 1, start: '08:20', end: '09:30' },
  { number: 2, start: '09:40', end: '10:50' },
  { number: 3, start: '11:00', end: '12:10' },
  { number: 4, start: '12:20', end: '13:30' },
  { number: 5, start: '14:50', end: '16:00' },
  { number: 6, start: '16:10', end: '17:20' },
  { number: 7, start: '17:30', end: '18:40' },
  { number: 8, start: '18:50', end: '20:00' },
  { number: 9, start: '20:10', end: '21:20' },
]

const MOCK_COURSES: Omit<CourseOccupancy, 'section'>[] = [
  { code: 'IIC1103', name: 'Introducción a la Programación' },
  { code: 'IIC2233', name: 'Programación Avanzada' },
  { code: 'IIC2343', name: 'Arquitectura de Computadores' },
  { code: 'IIC2413', name: 'Bases de Datos' },
  { code: 'IIC3113', name: 'Gestión de Proyectos de Tecnologías de Información' },
  { code: 'MAT1610', name: 'Cálculo I' },
  { code: 'MAT1620', name: 'Cálculo II' },
  { code: 'MAT1203', name: 'Álgebra Lineal' },
  { code: 'FIS1514', name: 'Dinámica' },
  { code: 'ICS1513', name: 'Introducción a la Economía' },
  { code: 'ICS2123', name: 'Modelos Estocásticos' },
  { code: 'ICE1514', name: 'Termodinámica' },
]

function buildAvailability(): Availability[] {
  const result: Availability[] = []
  for (const room of MOCK_ROOMS) {
    for (const day of MOCK_DAYS) {
      for (const module of MOCK_MODULES) {
        const h = hash(`${room.id}-${day.code}-${module.number}`)
        // Menos ocupación los sábados y en los últimos módulos del día.
        const occupancyPercent = day.code === 'S' ? 10 : module.number >= 8 ? 30 : 60
        const isFree = h % 100 >= occupancyPercent
        const course = MOCK_COURSES[h % MOCK_COURSES.length]
        result.push({
          roomId: room.id,
          buildingCode: room.buildingCode,
          day: day.code,
          module: module.number,
          isFree,
          course: isFree || !course ? null : { ...course, section: (h % 5) + 1 },
        })
      }
    }
  }
  return result
}

export const MOCK_AVAILABILITY: Availability[] = buildAvailability()

/** Última actualización simulada desde BuscaCursos: hace 4 minutos al cargar la app. */
export const MOCK_LAST_SYNC_AT = new Date(Date.now() - 4 * 60_000).toISOString()
