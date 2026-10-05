import type { ReportStatus, ReportType } from '../../types'

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  'shown-free-but-busy': 'Aparece "Disponible" pero la sala está ocupada',
  'shown-busy-but-free': 'Aparece "Ocupada" pero la sala está vacía',
  equipment: 'Equipamiento dañado (proyector, enchufes, etc.)',
  locked: 'Sala cerrada con llave o sin acceso',
  other: 'Otro problema de infraestructura',
}

/** Versión corta para listados. */
export const REPORT_TYPE_SHORT: Record<ReportType, string> = {
  'shown-free-but-busy': 'Ocupada sin aviso',
  'shown-busy-but-free': 'Vacía pese a figurar ocupada',
  equipment: 'Equipamiento',
  locked: 'Sin acceso',
  other: 'Otro',
}

export const REPORT_STATUS_STYLES: Record<ReportStatus, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-status-nodata-container text-status-nodata' },
  'in-review': { label: 'En revisión', className: 'bg-status-soon-container text-status-soon' },
  resolved: { label: 'Resuelto', className: 'bg-status-free-container text-status-free' },
}
