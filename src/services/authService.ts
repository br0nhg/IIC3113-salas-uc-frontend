import type { AuthSession, LoginInput, RegisterInput, User } from '../types'
import { USE_MOCK } from './config'
import { deleteJson, patchJson, postJson, setAuthToken } from './http'
import { GUEST_USER, MOCK_USERS, type MockUserRecord } from './mock/auth'
import { mockError, mockResponse } from './mock/utils'
import { readJson, removeKey, writeJson } from './storage'

/*
 * Autenticación. En modo mock las cuentas registradas se guardan en
 * localStorage; con VITE_API_URL definida se usan los endpoints tentativos
 * POST /auth/login, /auth/register y /auth/logout, que devuelven AuthSession.
 * La sesión se guarda en localStorage ("recordar") o en sessionStorage.
 */

const SESSION_KEY = 'session'
const MOCK_USERS_KEY = 'mock-users'
/** Cambios a las cuentas de prueba fijas (nombre editado o cuenta eliminada). */
const MOCK_OVERRIDES_KEY = 'mock-user-overrides'

type MockOverrides = Record<string, { name?: string; deleted?: boolean }>

function saveSession(session: AuthSession, remember: boolean): AuthSession {
  removeKey(SESSION_KEY, 'local')
  removeKey(SESSION_KEY, 'session')
  writeJson(SESSION_KEY, session, remember ? 'local' : 'session')
  setAuthToken(session.token)
  return session
}

function clearSession(): void {
  removeKey(SESSION_KEY, 'local')
  removeKey(SESSION_KEY, 'session')
  setAuthToken(null)
}

/** Sesión guardada en el navegador, si existe. Es síncrona para el render inicial. */
export function getStoredSession(): AuthSession | null {
  const session =
    readJson<AuthSession | null>(SESSION_KEY, null, 'local') ??
    readJson<AuthSession | null>(SESSION_KEY, null, 'session')
  setAuthToken(session?.token ?? null)
  return session
}

function getMockUsers(): MockUserRecord[] {
  const overrides = readJson<MockOverrides>(MOCK_OVERRIDES_KEY, {})
  return [...MOCK_USERS, ...readJson<MockUserRecord[]>(MOCK_USERS_KEY, [])]
    .filter((user) => !overrides[user.id]?.deleted)
    .map((user) => ({ ...user, name: overrides[user.id]?.name ?? user.name }))
}

function overrideMockUser(id: string, change: MockOverrides[string]): void {
  const overrides = readJson<MockOverrides>(MOCK_OVERRIDES_KEY, {})
  writeJson(MOCK_OVERRIDES_KEY, { ...overrides, [id]: { ...overrides[id], ...change } })
}

/** Sesión actual con los datos del usuario actualizados, en el mismo almacenamiento. */
function updateStoredUser(user: User): AuthSession {
  const remember = readJson<AuthSession | null>(SESSION_KEY, null, 'local') !== null
  const session = getStoredSession()
  return saveSession({ user, token: session?.token ?? '' }, remember)
}

function toUser({ password: _password, ...user }: MockUserRecord): User {
  return user
}

function mockToken(user: User): string {
  return `mock-token-${user.id}`
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const email = input.email.trim().toLowerCase()
  if (USE_MOCK) {
    const record = getMockUsers().find((u) => u.email === email && u.password === input.password)
    if (!record) return mockError(401, 'Correo o contraseña incorrectos.')
    const user = toUser(record)
    return mockResponse(saveSession({ user, token: mockToken(user) }, input.remember), 400)
  }
  const session = await postJson<AuthSession>('/auth/login', { email, password: input.password })
  return saveSession(session, input.remember)
}

export async function register(input: RegisterInput): Promise<AuthSession> {
  const email = input.email.trim().toLowerCase()
  if (USE_MOCK) {
    if (getMockUsers().some((u) => u.email === email)) {
      return mockError(409, 'Ya existe una cuenta con ese correo.')
    }
    const record: MockUserRecord = {
      id: `u-${Date.now()}`,
      name: input.name.trim(),
      email,
      role: 'student',
      password: input.password,
    }
    writeJson(MOCK_USERS_KEY, [...readJson<MockUserRecord[]>(MOCK_USERS_KEY, []), record])
    const user = toUser(record)
    return mockResponse(saveSession({ user, token: mockToken(user) }, true), 400)
  }
  const session = await postJson<AuthSession>('/auth/register', {
    name: input.name.trim(),
    email,
    password: input.password,
  })
  return saveSession(session, true)
}

/** El acceso de invitado no pasa por la API: solo consulta datos públicos. */
export function loginAsGuest(): AuthSession {
  return saveSession({ user: GUEST_USER, token: '' }, false)
}

export async function logout(): Promise<void> {
  const session = getStoredSession()
  clearSession()
  if (!USE_MOCK && session && session.user.role !== 'guest') {
    // Cerrar sesión localmente aunque la API falle.
    await postJson<void>('/auth/logout').catch(() => undefined)
  }
}

/** Cambia el nombre del usuario con sesión (REQ-04). */
export async function updateProfile(name: string): Promise<AuthSession> {
  const trimmed = name.trim()
  if (USE_MOCK) {
    const current = getStoredSession()?.user
    if (!current || current.role === 'guest') return mockError(401, 'Debes iniciar sesión.')
    if (!trimmed) return mockError(400, 'Ingresa tu nombre.')
    overrideMockUser(current.id, { name: trimmed })
    return mockResponse(updateStoredUser({ ...current, name: trimmed }), 400)
  }
  const { user } = await patchJson<{ user: User }>('/me', { name: trimmed })
  return updateStoredUser(user)
}

/** Elimina la cuenta del usuario con sesión, confirmando con su contraseña (REQ-05). */
export async function deleteAccount(password: string): Promise<void> {
  if (USE_MOCK) {
    const current = getStoredSession()?.user
    const record = current && getMockUsers().find((user) => user.id === current.id)
    if (!record) return mockError(401, 'Debes iniciar sesión.')
    if (record.password !== password) return mockError(403, 'La contraseña no es correcta.')
    overrideMockUser(record.id, { deleted: true })
    clearSession()
    return mockResponse(undefined, 400)
  }
  await deleteJson('/me', { password })
  clearSession()
}
