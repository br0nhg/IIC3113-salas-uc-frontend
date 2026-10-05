import type { AuthSession, LoginInput, RegisterInput, User } from '../types'
import { USE_MOCK } from './config'
import { postJson, setAuthToken } from './http'
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
  return [...MOCK_USERS, ...readJson<MockUserRecord[]>(MOCK_USERS_KEY, [])]
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
