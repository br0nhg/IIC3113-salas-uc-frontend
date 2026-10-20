import type { User } from '../../types'

/** Usuario mock con contraseña. Solo para pruebas locales, nunca datos reales. */
export interface MockUserRecord extends User {
  password: string
}

/** Cuentas de prueba disponibles en modo mock (ver README). */
export const MOCK_USERS: MockUserRecord[] = [
  {
    id: 'u-admin',
    name: 'Administración SalasUC',
    email: 'admin@uc.cl',
    role: 'admin',
    password: 'admin1234',
  },
  {
    id: 'u-estudiante',
    name: 'Estudiante de Prueba',
    email: 'estudiante@uc.cl',
    role: 'student',
    password: 'salasuc123',
  },
]

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Invitado',
  email: null,
  role: 'guest',
}
