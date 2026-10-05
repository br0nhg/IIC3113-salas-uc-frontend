import type { ReportStatus } from '../../types'
import { cn } from '../../utils/cn'
import { REPORT_STATUS_STYLES } from './reportPresentation'

/** Estado de un reporte: Pendiente, En revisión o Resuelto. */
export default function ReportStatusBadge({ status }: { status: ReportStatus }) {
  const style = REPORT_STATUS_STYLES[status]
  return (
    <span className={cn('shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold', style.className)}>
      {style.label}
    </span>
  )
}
