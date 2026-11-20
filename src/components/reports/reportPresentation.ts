import type { DateSlot, ReportReason, ReportStatus } from '../../types'

/** Motivos por los que una sala que aparece libre está ocupada (mismos que la API). */
export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  class: 'Clase o ayudantía no programada',
  event: 'Evento o actividad',
  exam: 'Prueba o interrogación',
  locked: 'Sala cerrada o sin acceso',
  maintenance: 'Mantención o reparación',
  other: 'Otro motivo',
}

export const REPORT_STATUS_STYLES: Record<ReportStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-status-soon-container text-status-soon' },
  accepted: { label: 'Aceptado', className: 'bg-status-busy-container text-status-busy' },
  rejected: { label: 'Rechazado', className: 'bg-status-nodata-container text-status-nodata' },
  expired: { label: 'Vencido', className: 'bg-status-nodata-container text-status-nodata' },
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-CL', { weekday: 'short', day: 'numeric', month: 'numeric' })

/** "vie, 20-11 · M7" */
export function formatDateSlot(slot: DateSlot): string {
  return `${DATE_FORMAT.format(new Date(`${slot.date}T12:00:00`))} · M${slot.module}`
}
