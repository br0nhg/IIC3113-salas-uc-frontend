import type { Report, ReportInput } from '../types'
import { getJson, postJson } from './http'
import { currentUserId, mockId, readUserData, writeUserData } from './mock/userStore'
import { mockError, mockResponse } from './mock/utils'

/*
 * Reportes de problemas en salas enviados por el usuario con cuenta.
 * Endpoints tentativos: GET /me/reports, POST /reports.
 */

// El backend aún no implementa /me/reports ni /reports: se guarda en el navegador por usuario.
const USE_MOCK = true

const KEY = 'reports'

export function getMyReports(): Promise<Report[]> {
  if (USE_MOCK) {
    const userId = currentUserId()
    return mockResponse(userId ? readUserData<Report[]>(userId, KEY, []) : [])
  }
  return getJson<Report[]>('/me/reports')
}

export function createReport(input: ReportInput): Promise<Report> {
  if (USE_MOCK) {
    const userId = currentUserId()
    if (!userId) return mockError(401, 'Inicia sesión con tu cuenta UC para enviar reportes.')
    const report: Report = {
      ...input,
      detail: input.detail.trim(),
      id: mockId('r'),
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    writeUserData(userId, KEY, [report, ...readUserData<Report[]>(userId, KEY, [])])
    return mockResponse(report, 400)
  }
  return postJson<Report>('/reports', input)
}
