/** URL base de la API, sin "/" final. Vacía = modo mock. */
export const API_URL: string = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/+$/, '')

/** Mientras VITE_API_URL no esté definida, los servicios entregan datos de prueba. */
export const USE_MOCK: boolean = API_URL === ''
