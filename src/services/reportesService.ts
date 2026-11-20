import type { Report, ReportInput } from '../types'
import { USE_MOCK } from './config'
import { getJson, postJson } from './http'
import { getStoredSession } from './authService'
import { isMockBlockOver, readMockReports, toMockReport, writeMockReports } from './mock/reports'
import { mockId } from './mock/userStore'
import { mockError, mockResponse } from './mock/utils'

/*
 * Reportes de ocupación: el usuario con cuenta avisa que una sala que aparece
 * libre está ocupada en un día y módulo. El administrador los revisa
 * (ver adminService). Endpoints: GET /me/reports y POST /reports.
 */

export function getMyReports(): Promise<Report[]> {
  if (USE_MOCK) {
    const user = getStoredSession()?.user
    if (!user || user.role === 'guest') return mockResponse([])
    return mockResponse(readMockReports().filter((r) => r.userId === user.id).map(toMockReport))
  }
  return getJson<Report[]>('/me/reports')
}

export function createReport(input: ReportInput): Promise<Report> {
  const detail = input.detail.trim()
  if (USE_MOCK) {
    const user = getStoredSession()?.user
    if (!user || user.role === 'guest') {
      return mockError(401, 'Inicia sesión con tu cuenta UC para enviar reportes.')
    }
    if (isMockBlockOver(input.date, input.module)) {
      return mockError(400, 'Ese módulo ya terminó; solo se pueden reportar módulos en curso o futuros.')
    }
    if (input.reason === 'other' && !detail) return mockError(400, 'Describe el motivo en el detalle.')
    const reports = readMockReports()
    const duplicate = reports.some(
      (r) =>
        r.userId === user.id &&
        r.roomId === input.roomId &&
        r.date === input.date &&
        r.module === input.module &&
        r.status === 'pending',
    )
    if (duplicate) return mockError(409, 'Ya reportaste esta sala en ese módulo; está en revisión.')
    const record = {
      ...input,
      detail,
      id: mockId('r'),
      userId: user.id,
      reporter: { name: user.name, email: user.email ?? '' },
      status: 'pending' as const,
      blockedUntil: null,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
    }
    writeMockReports([record, ...reports])
    return mockResponse(toMockReport(record), 400)
  }
  return postJson<Report>('/reports', { ...input, detail })
}
