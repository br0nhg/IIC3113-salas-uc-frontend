import { useEffect, useRef, useState } from 'react'
import SyncStatusPill from '../../components/admin/SyncStatusPill'
import Alert from '../../components/ui/Alert'
import Button from '../../components/ui/Button'
import Panel from '../../components/ui/Panel'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../context/toast-context'
import { ApiError, getScraperStatus, getSyncStatus, startScraper } from '../../services'
import type { ScraperStatus } from '../../types'
import { cn } from '../../utils/cn'

/** Mientras el scraper corre, el estado se consulta cada pocos segundos. */
const POLL_MS = 3000

const STATUS_INFO: Record<ScraperStatus['status'], { label: string; className: string }> = {
  idle: { label: 'Sin ejecuciones desde que inició el servidor', className: 'text-outline' },
  running: { label: 'En ejecución', className: 'text-status-soon' },
  completed: { label: 'Completada', className: 'text-status-free' },
  failed: { label: 'Falló', className: 'text-error' },
}

const DATE_TIME = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' })

function formatDateTime(iso: string | null): string {
  return iso ? DATE_TIME.format(new Date(iso)) : '—'
}

/** Sincronización con BuscaCursos (/admin/sincronizacion): estado, log y ejecución manual. */
export default function AdminSyncPage() {
  const { showToast } = useToast()
  const [scraper, setScraper] = useState<ScraperStatus | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [starting, setStarting] = useState(false)
  // Se incrementa para volver a consultar el estado.
  const [version, setVersion] = useState(0)
  // Estado anterior, para avisar cuando una ejecución termina.
  const previousStatus = useRef<ScraperStatus['status'] | null>(null)

  const running = scraper?.status === 'running'

  useEffect(() => {
    let cancelled = false
    Promise.all([getScraperStatus(), getSyncStatus()])
      .then(([status, sync]) => {
        if (cancelled) return
        if (previousStatus.current === 'running' && status.status === 'completed') {
          showToast('Datos sincronizados con BuscaCursos')
        } else if (previousStatus.current === 'running' && status.status === 'failed') {
          showToast('La sincronización falló. Revisa el log.', 'error')
        }
        previousStatus.current = status.status
        setScraper(status)
        setLastSyncAt(sync.lastSyncAt)
        setError(false)
      })
      .catch(() => {
        if (!cancelled) setError(true)
      })
    return () => {
      cancelled = true
    }
  }, [version, showToast])

  // Sigue consultando mientras el scraper esté corriendo.
  useEffect(() => {
    if (!running) return
    const timer = window.setTimeout(() => setVersion((value) => value + 1), POLL_MS)
    return () => window.clearTimeout(timer)
  }, [running, scraper])

  async function handleStart() {
    setStarting(true)
    try {
      await startScraper()
      showToast('Sincronización iniciada; puede tardar varios minutos', 'info')
      setVersion((value) => value + 1)
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'No se pudo iniciar la sincronización.', 'error')
    } finally {
      setStarting(false)
    }
  }

  const info = scraper ? STATUS_INFO[scraper.status] : null

  return (
    <div className="space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">ADMINISTRACIÓN</span>
          <h1 className="mt-1 text-headline-md text-primary md:text-headline-lg">Sincronización con BuscaCursos</h1>
          <p className="text-body-sm text-outline">
            El scraper lee BuscaCursos (solo lectura) y reemplaza la ocupación de las salas. Si falla o la
            descarga queda incompleta, la base no cambia y la app sigue mostrando la última carga exitosa.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SyncStatusPill lastSyncAt={lastSyncAt} syncing={running} />
          <Button icon="sync" loading={starting || running} onClick={() => void handleStart()}>
            {running ? 'Sincronizando…' : 'Sincronizar ahora'}
          </Button>
        </div>
      </div>

      {error && <Alert variant="error">No se pudo consultar el estado de la sincronización.</Alert>}

      <Panel title="Última ejecución" icon="history">
        {!scraper ? (
          <Skeleton className="h-20" />
        ) : (
          <dl className="grid grid-cols-1 gap-3 text-body-sm sm:grid-cols-3">
            <div>
              <dt className="text-label-mono text-outline uppercase">Estado</dt>
              <dd className={cn('font-semibold', info?.className)}>
                {info?.label}
                {scraper.status === 'failed' && scraper.exitCode !== null && ` (código ${scraper.exitCode})`}
              </dd>
            </div>
            <div>
              <dt className="text-label-mono text-outline uppercase">Inicio</dt>
              <dd className="text-on-surface">{formatDateTime(scraper.startedAt)}</dd>
            </div>
            <div>
              <dt className="text-label-mono text-outline uppercase">Término</dt>
              <dd className="text-on-surface">{formatDateTime(scraper.finishedAt)}</dd>
            </div>
          </dl>
        )}
      </Panel>

      <Panel title="Log" icon="terminal">
        {!scraper ? (
          <Skeleton className="h-40" />
        ) : scraper.log.length === 0 ? (
          <p className="text-body-sm text-outline">Aún no hay líneas de log.</p>
        ) : (
          <pre className="max-h-96 overflow-auto rounded bg-surface-container p-3 font-mono text-xs whitespace-pre-wrap text-on-surface">
            {scraper.log.join('\n')}
          </pre>
        )}
        <p className="mt-2 text-[11px] text-outline">Se muestran las últimas 100 líneas.</p>
      </Panel>
    </div>
  )
}
