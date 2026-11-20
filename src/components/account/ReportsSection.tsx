import type { Report } from '../../types'
import { formatRelativeTime } from '../../utils/schedule'
import { formatDateSlot, REPORT_REASON_LABELS } from '../reports/reportPresentation'
import ReportStatusBadge from '../reports/ReportStatusBadge'
import EmptyState from '../ui/EmptyState'
import Panel from '../ui/Panel'
import Skeleton from '../ui/Skeleton'

interface ReportsSectionProps {
  reports: Report[] | null
  loading: boolean
  error: boolean
}

/** Reportes enviados por el usuario con su estado de revisión. */
export default function ReportsSection({ reports, loading, error }: ReportsSectionProps) {
  return (
    <Panel id="reportes" title="Mis reportes" icon="campaign" iconClassName="text-error">
      <p className="mb-4 text-body-sm text-outline">
        Un administrador revisa cada reporte. Si lo acepta, la sala aparece ocupada para todos
        durante el tiempo que indique.
      </p>
      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : error ? (
        <EmptyState icon="cloud_off" title="No se pudieron cargar tus reportes" className="py-6" />
      ) : !reports || reports.length === 0 ? (
        <EmptyState
          icon="flag"
          title="Aún no has enviado reportes"
          description="Si una sala aparece libre pero está ocupada, avísanos desde su detalle."
          className="py-6"
        />
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="rounded border border-outline-variant/30 bg-surface-container-low p-3"
            >
              <div className="mb-1 flex items-start justify-between gap-2 text-xs">
                <span className="font-bold text-primary">
                  {report.roomId} · {formatDateSlot(report)}
                </span>
                <ReportStatusBadge status={report.status} />
              </div>
              <p className="text-xs font-medium text-on-surface">{REPORT_REASON_LABELS[report.reason]}</p>
              {report.detail && (
                <p className="text-xs text-on-surface-variant">“{report.detail}”</p>
              )}
              {report.blockedUntil && (
                <p className="mt-1 text-xs text-status-busy">
                  Ocupada hasta {formatDateSlot(report.blockedUntil)}
                </p>
              )}
              <p className="mt-2 text-[11px] text-outline">
                Reportado {formatRelativeTime(report.createdAt)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
