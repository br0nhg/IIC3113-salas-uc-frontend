import { API_URL } from './config'

type QueryParams = Record<string, string | number | boolean | undefined>

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

/** Token de la sesión actual; lo fija authService al iniciar o cerrar sesión. */
let authToken: string | null = null

export function setAuthToken(token: string | null): void {
  authToken = token
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    Accept: 'application/json',
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    ...extra,
  }
}

async function parseResponse<T>(response: Response, path: string): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.status, `Error ${response.status} al consultar ${path}`)
  }
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

/** GET a la API del backend que devuelve JSON. */
export async function getJson<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, { headers: buildHeaders() })
  return parseResponse<T>(response, path)
}

/** POST con cuerpo JSON a la API del backend. */
export async function postJson<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: buildHeaders({ 'Content-Type': 'application/json' }),
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseResponse<T>(response, path)
}
