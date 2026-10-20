import { ApiError } from '../http'

/** Simula latencia de red en modo mock. */
export function mockResponse<T>(data: T, delayMs = 150): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs))
}

/** Simula una respuesta de error de la API en modo mock. */
export function mockError(status: number, message: string, delayMs = 250): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(new ApiError(status, message)), delayMs))
}
