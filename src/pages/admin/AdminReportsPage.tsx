import { useEffect, useState, type FormEvent } from 'react'
import { formatDateSlot, REPORT_REASON_LABELS } from '../../components/reports/reportPresentation'
import ReportStatusBadge from '../../components/reports/ReportStatusBadge'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import Panel from '../../components/ui/Panel'
import SegmentedControl, { type SegmentOption } from '../../components/ui/SegmentedControl'
import Select from '../../components/ui/Select'
import Skeleton from '../../components/ui/Skeleton'
import TextField from '../../components/ui/TextField'
import { useToast } from '../../context/toast-context'
import { useCatalog } from '../../hooks/useCatalog'
import { useAdminOutlet } from '../../layouts/admin-outlet'
import { ApiError, getAdminReports, reviewReport } from '../../services'
import type { AdminReport, AdminReportFilter, ModuleNumber, TimeModule } from '../../types'
import { formatModuleRange, formatRelativeTime } from '../../utils/schedule'

const FILTERS: SegmentOption<AdminReportFilter>[] = [
  { value: 'pending', label: 'Pendientes' },
  { value: 'accepted', label: 'Aceptados' },
  { value: 'all', label: 'Todos' },
]

/** Máximo de días que puede durar el bloqueo (igual que la API). */
const MAX_BLOCK_DAYS = 14

function addDays(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00`)
  next.setDate(next.getDate() + days)
  return [next.getFullYear(), String(next.getMonth() + 1).padStart(2, '0'), String(next.getDate()).padStart(2, '0')].join('-')
}

/** Sábado de la semana del reporte (o el mismo día si ya es sábado). */
function saturdayOf(date: string): string {
  const day = new Date(`${date}T12:00:00`).getDay()
  return addDays(date, day === 0 ? 6 : 6 - day)
}

interface ReportsState {
  filter: AdminReportFilter
  version: number
  reports: AdminReport[] | null
  error: boolean
}

/** Revisión de reportes de ocupación (/admin/reportes): aceptar con duración o rechazar. */
export default function AdminReportsPage() {
  const { showToast } = useToast()
  const { refreshOpenReports } = useAdminOutlet()
  const { catalog } = useCatalog()
  const [filter, setFilter] = useState<AdminReportFilter>('pending')
  const [version, setVersion] = useState(0)
  const [state, setState] = useState<ReportsState | null>(null)
  const [accepting, setAccepting] = useState<AdminReport | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAdminReports(filter)
      .then((reports) => {
        if (!cancelled) setState({ filter, version, reports, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ filter, version, reports: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [filter, version])

  const loading = state?.filter !== filter || state.version !== version
  const reports = loading ? null : state.reports

  function reload() {
    setVersion((value) => value + 1)
    refreshOpenReports()
  }

  async function reject(report: AdminReport) {
    if (!window.confirm(`¿Rechazar el reporte de ${report.roomId}?`)) return
    setRejectingId(report.id)
    try {
      await reviewReport(report.id, { action: 'reject' })
      showToast('Reporte rechazado', 'info')
      reload()
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'No se pudo rechazar el reporte.', 'error')
    } finally {
      setRejectingId(null)
    }
  }

  return (
    <div className="space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
      <div>
        <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">ADMINISTRACIÓN</span>
        <h1 className="mt-1 text-headline-md text-primary md:text-headline-lg">Reportes de ocupación</h1>
        <p className="text-body-sm text-outline">
          Avisos de usuarios sobre salas que aparecen libres pero están ocupadas. Al aceptar uno, la sala
          se muestra ocupada hasta el módulo que elijas y luego vuelve a quedar disponible.
        </p>
      </div>

      <Panel title="Reportes" icon="flag" iconClassName="text-error">
        <div className="mb-4 flex">
          <SegmentedControl label="Filtrar reportes" options={FILTERS} value={filter} onChange={setFilter} />
        </div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : state.error ? (
          <Alert variant="error">No se pudieron cargar los reportes.</Alert>
        ) : !reports || reports.length === 0 ? (
          <EmptyState
            icon="task_alt"
            title={filter === 'pending' ? 'No hay reportes pendientes' : 'No hay reportes'}
            description={filter === 'pending' ? 'Los reportes vencen solos cuando termina el módulo reportado.' : undefined}
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report.id} className="rounded border border-outline-variant/30 bg-surface-container-low p-3 md:p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-primary">
                      {report.roomId} <span className="font-normal capitalize text-on-surface-variant">· {formatDateSlot(report)}</span>
                    </p>
                    <p className="text-body-sm font-medium text-on-surface">{REPORT_REASON_LABELS[report.reason]}</p>
                  </div>
                  <ReportStatusBadge status={report.status} />
                </div>
                {report.detail && <p className="mt-1 text-body-sm text-on-surface-variant">“{report.detail}”</p>}
                {report.blockedUntil && (
                  <p className="mt-1 text-xs text-status-busy">
                    Ocupada hasta <span className="capitalize">{formatDateSlot(report.blockedUntil)}</span>
                  </p>
                )}
                <p className="mt-2 text-xs text-outline">
                  Reportado por {report.reporter ? `${report.reporter.name} (${report.reporter.email})` : 'una cuenta eliminada'}{' '}
                  {formatRelativeTime(report.createdAt)}
                </p>
                {report.status === 'pending' && (
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      icon="close"
                      loading={rejectingId === report.id}
                      onClick={() => void reject(report)}
                    >
                      Rechazar
                    </Button>
                    <Button size="sm" icon="check" onClick={() => setAccepting(report)} disabled={!catalog}>
                      Aceptar
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {accepting && catalog && (
        <Modal open title={`Aceptar reporte · ${accepting.roomId}`} icon="event_busy" onClose={() => setAccepting(null)}>
          <AcceptReportForm
            report={accepting}
            modules={catalog.modules}
            onCancel={() => setAccepting(null)}
            onAccepted={() => {
              setAccepting(null)
              showToast(`${accepting.roomId} quedará ocupada durante el periodo indicado`)
              reload()
            }}
          />
        </Modal>
      )}
    </div>
  )
}

function AcceptReportForm({
  report,
  modules,
  onCancel,
  onAccepted,
}: {
  report: AdminReport
  modules: TimeModule[]
  onCancel: () => void
  onAccepted: () => void
}) {
  const lastModule = modules[modules.length - 1]?.number ?? report.module
  const [untilDate, setUntilDate] = useState(report.date)
  const [untilModule, setUntilModule] = useState<ModuleNumber>(report.module)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // En el mismo día del reporte solo se puede terminar desde el módulo reportado.
  const moduleOptions = modules.filter((m) => untilDate !== report.date || m.number >= report.module)
  const presets: { label: string; date: string; module: ModuleNumber }[] = [
    { label: 'Solo este módulo', date: report.date, module: report.module },
    { label: 'Resto del día', date: report.date, module: lastModule },
    { label: 'Hasta el sábado', date: saturdayOf(report.date), module: lastModule },
  ]

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await reviewReport(report.id, { action: 'accept', untilDate, untilModule })
      onAccepted()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo aceptar el reporte.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={(event) => void submit(event)} className="space-y-4 p-5">
      {error && <Alert variant="error">{error}</Alert>}
      <p className="text-body-sm text-on-surface-variant">
        La sala se mostrará <strong>ocupada</strong> desde{' '}
        <span className="capitalize">{formatDateSlot(report)}</span> hasta el módulo que indiques (inclusive).
        Si hay una reserva oficial en el mismo bloque, se muestra la reserva.
      </p>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={untilDate === preset.date && untilModule === preset.module ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => {
              setUntilDate(preset.date)
              setUntilModule(preset.module)
            }}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          type="date"
          label="Ocupada hasta el día"
          value={untilDate}
          min={report.date}
          max={addDays(report.date, MAX_BLOCK_DAYS)}
          required
          onChange={(event) => {
            const next = event.target.value
            setUntilDate(next)
            if (next === report.date && untilModule < report.module) setUntilModule(report.module)
          }}
        />
        <Select
          label="Hasta el módulo"
          value={untilModule}
          onChange={(event) => setUntilModule(Number(event.target.value) as ModuleNumber)}
        >
          {moduleOptions.map((m) => (
            <option key={m.number} value={m.number}>
              M{m.number} · {formatModuleRange(m)}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col-reverse gap-2 border-t border-surface-container-high pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" icon="check" loading={saving}>
          Aceptar reporte
        </Button>
      </div>
    </form>
  )
}
