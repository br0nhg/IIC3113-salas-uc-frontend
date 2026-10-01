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

/** GET a la API del backend que devuelve JSON. */
export async function getJson<T>(path: string, params: QueryParams = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) url.searchParams.set(key, String(value))
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!response.ok) {
    throw new ApiError(response.status, `Error ${response.status} al consultar ${path}`)
  }
  return (await response.json()) as T
}
