import { useEffect, useState } from 'react'
import AdminRoomsTable from '../../components/admin/AdminRoomsTable'
import MetricCard from '../../components/admin/MetricCard'
import SyncStatusPill from '../../components/admin/SyncStatusPill'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Icon from '../../components/ui/Icon'
import Skeleton from '../../components/ui/Skeleton'
import { useToast } from '../../context/toast-context'
import { useCatalog, type Catalog } from '../../hooks/useCatalog'
import { getAdminMetrics, getAdminRooms, getSyncStatus, triggerSync, USE_MOCK } from '../../services'
import type { AdminMetrics, AdminRoomRow } from '../../types'
import { formatChange, formatInteger } from '../../utils/numbers'
import { formatModuleRange, getCurrentSlot } from '../../utils/schedule'

/** Consola de administración: sincronización, métricas y salas (/admin). */
export default function AdminDashboardPage() {
  const { catalog, error } = useCatalog()
  if (error) {
    return <EmptyState icon="cloud_off" title="No se pudieron cargar los datos" className="py-16" />
  }
  if (!catalog) {
    return (
      <div className="space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
        <Skeleton className="h-12 w-80" />
        <Skeleton className="h-28" />
        <Skeleton className="h-80" />
      </div>
    )
  }
  return <Dashboard catalog={catalog} />
}

interface RowsState {
  key: string
  rows: AdminRoomRow[] | null
  error: boolean
}

function Dashboard({ catalog }: { catalog: Catalog }) {
  const { showToast } = useToast()
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)
  const [syncing, setSyncing] = useState(false)
  // Se incrementa tras cada sincronización para recargar la tabla.
  const [syncVersion, setSyncVersion] = useState(0)
  const [rowsState, setRowsState] = useState<RowsState | null>(null)

  const now = getCurrentSlot(catalog.modules)
  const day = now?.day ?? 'L'
  const module = now?.module ?? 1
  const moduleInfo = catalog.modules.find((m) => m.number === module)
  const dayName = catalog.days.find((d) => d.code === day)?.name ?? day
  const contextLabel = `${dayName} · M${module}${moduleInfo ? ` (${formatModuleRange(moduleInfo)})` : ''}`

  useEffect(() => {
    getAdminMetrics()
      .then(setMetrics)
      .catch(() => undefined)
    getSyncStatus()
      .then((status) => setLastSyncAt(status.lastSyncAt))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    let cancelled = false
    const key = `${day}-${module}-${syncVersion}`
    getAdminRooms({ day, module })
      .then((rows) => {
        if (!cancelled) setRowsState({ key, rows, error: false })
      })
      .catch(() => {
        if (!cancelled) setRowsState({ key, rows: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [day, module, syncVersion])

  async function handleSync() {
    setSyncing(true)
    try {
      const status = await triggerSync()
      setLastSyncAt(status.lastSyncAt)
      setSyncVersion((version) => version + 1)
      showToast('Datos sincronizados con BuscaCursos')
    } catch {
      showToast('No se pudo sincronizar. Intenta nuevamente.', 'error')
    } finally {
      setSyncing(false)
    }
  }

  const peak = metrics?.peakModules.map((m) => `M${m}`).join(' y ')

  return (
    <div className="space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">
              CAMPUS SAN JOAQUÍN
            </span>
            <span className="text-xs text-outline">
              {USE_MOCK ? 'Modo demostración (datos de prueba)' : 'Entorno de producción'}
            </span>
          </div>
          <h1 className="mt-1 text-headline-md text-primary md:text-headline-lg">
            Panel de control y sincronización
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SyncStatusPill lastSyncAt={lastSyncAt} syncing={syncing} />
          <Button icon="sync" loading={syncing} onClick={() => void handleSync()}>
            Sincronizar ahora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Usuarios activos (7 días)"
          value={metrics && formatInteger(metrics.weeklyActiveUsers)}
          footnote={
            metrics && (
              <span className="flex items-center gap-1 text-status-free">
                <Icon name={metrics.weeklyActiveUsersChange >= 0 ? 'trending_up' : 'trending_down'} className="text-[14px]" />
                {formatChange(metrics.weeklyActiveUsersChange)} esta semana
              </span>
            )
          }
        />
        <MetricCard
          label="Consultas hoy"
          value={metrics && formatInteger(metrics.queriesToday)}
          footnote={peak && <span className="text-outline">Peak en los módulos {peak}</span>}
        />
        <MetricCard
          label="Retención"
          value={metrics && `${metrics.retentionRate} %`}
          footnote={<span className="text-status-free">Usan la app más de 3 días/sem.</span>}
        />
        <MetricCard
          label="Salas conectadas"
          value={metrics && formatInteger(metrics.connectedRooms)}
          footnote={
            <span className="text-outline">
              Sectores {catalog.buildings.map((b) => b.code).join(', ')}
            </span>
          }
        />
      </div>

      <AdminRoomsTable
        rows={rowsState?.rows ?? null}
        error={rowsState?.error ?? false}
        day={day}
        module={module}
        contextLabel={contextLabel}
      />
    </div>
  )
}
