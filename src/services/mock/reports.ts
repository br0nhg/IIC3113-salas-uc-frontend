import type { AdminReport, ModuleNumber, Report, ReportStatus } from '../../types'
import { readJson, writeJson } from '../storage'
import { MOCK_MODULES } from './data'

/*
 * Reportes de ocupación en modo mock: una sola lista en localStorage para que
 * el admin de prueba vea los reportes de todas las cuentas.
 */

export interface MockReportRecord extends AdminReport {
  userId: string
}

const KEY = 'occupancy-reports'

function localIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

const today = localIsoDate(new Date())
const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString()

/** Reportes de demostración de la cuenta estudiante@uc.cl. */
const SEED: MockReportRecord[] = [
  {
    id: 'r-seed-1',
    userId: 'u-estudiante',
    reporter: { name: 'Estudiante de Prueba', email: 'estudiante@uc.cl' },
    roomId: 'K201',
    date: today,
    module: 9,
    reason: 'event',
    detail: 'Ensayo de la rama de teatro.',
    status: 'pending',
    blockedUntil: null,
    createdAt: ago(30),
    reviewedAt: null,
  },
  {
    id: 'r-seed-2',
    userId: 'u-estudiante',
    reporter: { name: 'Estudiante de Prueba', email: 'estudiante@uc.cl' },
    roomId: 'BC23',
    date: today,
    module: 1,
    reason: 'locked',
    detail: '',
    status: 'rejected',
    blockedUntil: null,
    createdAt: ago(60 * 5),
    reviewedAt: ago(60 * 4),
  },
]

export function readMockReports(): MockReportRecord[] {
  return readJson<MockReportRecord[]>(KEY, SEED)
}

export function writeMockReports(reports: MockReportRecord[]): void {
  writeJson(KEY, reports)
}

/** Indica si el bloque (fecha, módulo) ya terminó, con la hora del navegador. */
export function isMockBlockOver(date: string, module: ModuleNumber, now = new Date()): boolean {
  const end = MOCK_MODULES.find((m) => m.number === module)?.end ?? '23:59'
  const todayDate = localIsoDate(now)
  return date < todayDate || (date === todayDate && now.toTimeString().slice(0, 5) > end)
}

/** Igual que la API: un pendiente cuyo bloque terminó se informa como vencido. */
function effectiveStatus(report: Report): ReportStatus {
  return report.status === 'pending' && isMockBlockOver(report.date, report.module) ? 'expired' : report.status
}

export function toMockAdminReport({ userId: _userId, ...report }: MockReportRecord): AdminReport {
  return { ...report, status: effectiveStatus(report) }
}

export function toMockReport(record: MockReportRecord): Report {
  const { reporter: _reporter, ...report } = toMockAdminReport(record)
  return report
}
