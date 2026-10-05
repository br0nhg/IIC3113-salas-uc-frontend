import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../../context/toast-context'
import { useAccountData } from '../../hooks/useAccountData'
import type { Catalog } from '../../hooks/useCatalog'
import { clearHistory, getHistory } from '../../services'
import type { HistoryEntry } from '../../types'
import { formatDayTime } from '../../utils/dates'
import { searchUrl } from '../../utils/searchParams'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Panel from '../ui/Panel'
import Skeleton from '../ui/Skeleton'

/** Texto y destino de una entrada del historial. */
function describe(entry: HistoryEntry, catalog: Catalog): { label: string; to: string; icon: string } {
  const dayName = (code: string) => catalog.days.find((d) => d.code === code)?.name ?? code
  if (entry.type === 'room') {
    return {
      icon: 'meeting_room',
      label: `Sala ${entry.roomId} · ${dayName(entry.day)}`,
      to: `/salas/${encodeURIComponent(entry.roomId)}?dia=${entry.day}`,
    }
  }
  const { buildingCode, day, module, onlyFree, query } = entry.filters
  const parts = [
    buildingCode ? `Sector ${buildingCode}` : 'Todos los sectores',
    dayName(day),
    `M${module}`,
    onlyFree && 'Solo libres',
    query && `"${query}"`,
  ].filter(Boolean)
  return { icon: 'search', label: parts.join(' · '), to: searchUrl(entry.filters) }
}

/** Historial de consultas: búsquedas con filtros y salas abiertas. */
export default function HistorySection({ catalog }: { catalog: Catalog }) {
  const { showToast } = useToast()
  const { data, loading, error, update } = useAccountData(getHistory)
  const [clearing, setClearing] = useState(false)
  const entries = data ?? []

  async function handleClear() {
    setClearing(true)
    try {
      await clearHistory()
      update(() => [])
      showToast('Historial borrado', 'info')
    } catch {
      showToast('No se pudo borrar el historial.', 'error')
    } finally {
      setClearing(false)
    }
  }

  return (
    <Panel
      id="historial"
      title="Historial de consultas"
      icon="history"
      iconClassName="text-outline"
      action={
        entries.length > 0 && (
          <button
            type="button"
            onClick={() => void handleClear()}
            disabled={clearing}
            className="min-h-11 px-1 text-label-mono text-secondary hover:underline disabled:opacity-50 sm:min-h-0"
          >
            Limpiar historial
          </button>
        )
      }
    >
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : error ? (
        <EmptyState icon="cloud_off" title="No se pudo cargar el historial" className="py-6" />
      ) : entries.length === 0 ? (
        <EmptyState
          icon="history"
          title="Sin consultas recientes"
          description="Tus búsquedas con filtros y las salas que abras aparecerán aquí."
          className="py-6"
        />
      ) : (
        <ul className="divide-y divide-surface-container-high text-body-sm">
          {entries.map((entry) => {
            const { icon, label, to } = describe(entry, catalog)
            return (
              <li key={entry.id}>
                <Link
                  to={to}
                  className="group flex min-h-11 items-center justify-between gap-3 py-2.5 hover:text-secondary"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Icon name={icon} className="text-[16px] text-outline group-hover:text-secondary" />
                    <span className="truncate">{label}</span>
                  </span>
                  <span className="shrink-0 text-xs text-outline">{formatDayTime(entry.createdAt)}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
