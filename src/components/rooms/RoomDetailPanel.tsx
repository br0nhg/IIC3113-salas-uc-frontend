import { useEffect, useState } from 'react'
import { Link, type To } from 'react-router-dom'
import { hasAccount, useAuth } from '../../context/auth-context'
import { useToast } from '../../context/toast-context'
import type { Catalog } from '../../hooks/useCatalog'
import { useFavorites } from '../../hooks/useFavorites'
import { addHistoryEntry, getRoomDetail, summarizeSchedule } from '../../services'
import type { DayCode, ModuleNumber, RoomDetail } from '../../types'
import { cn } from '../../utils/cn'
import { formatModuleRange, getCurrentSlot } from '../../utils/schedule'
import ReportModal from '../reports/ReportModal'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Skeleton from '../ui/Skeleton'
import RoomFeatureGrid from './RoomFeatureGrid'
import RoomSchedule from './RoomSchedule'
import RoomStatusPanel from './RoomStatusPanel'
import { formatFloor } from './roomPresentation'

interface RoomDetailPanelProps {
  roomId: string
  day: DayCode
  module: ModuleNumber
  catalog: Catalog
  /** Destino del botón cerrar / volver. */
  closeTo: To
  /** "drawer": panel lateral en escritorio; "page": página completa en móvil. */
  variant: 'drawer' | 'page'
}

interface DetailState {
  key: string
  detail: RoomDetail | null
  error: boolean
}

const iconButton =
  'flex size-11 items-center justify-center rounded text-outline transition-colors hover:bg-surface-container sm:size-10'

export default function RoomDetailPanel({
  roomId,
  day,
  module,
  catalog,
  closeTo,
  variant,
}: RoomDetailPanelProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { isFavorite, toggleFavorite } = useFavorites()
  const [state, setState] = useState<DetailState | null>(null)
  const [reportOpen, setReportOpen] = useState(false)

  const key = `${roomId}-${day}`

  useEffect(() => {
    let cancelled = false
    getRoomDetail(roomId, day)
      .then((detail) => {
        if (!cancelled) setState({ key: `${roomId}-${day}`, detail, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ key: `${roomId}-${day}`, detail: null, error: true })
      })
    addHistoryEntry({ type: 'room', roomId, day }).catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [roomId, day])

  const loading = state?.key !== key
  const detail = loading ? null : state.detail
  const dayName = catalog.days.find((d) => d.code === day)?.name ?? day
  const moduleInfo = catalog.modules.find((m) => m.number === module)
  const now = getCurrentSlot(catalog.modules)
  const live = Boolean(now?.inProgress && now.day === day && now.module === module)
  const favorite = isFavorite(roomId)

  function openReport() {
    if (!hasAccount(user)) {
      showToast('Inicia sesión con tu cuenta UC para enviar reportes.', 'info')
      return
    }
    setReportOpen(true)
  }

  const closeLink =
    variant === 'drawer' ? (
      <Link to={closeTo} aria-label="Cerrar detalle" className={iconButton}>
        <Icon name="close" />
      </Link>
    ) : null

  if (loading) {
    return (
      <div className="space-y-4 p-space-lg" aria-busy="true" aria-label="Cargando detalle de sala">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!detail) {
    return (
      <div>
        {closeLink && <div className="flex justify-end p-2">{closeLink}</div>}
        <EmptyState
          icon={state.error ? 'cloud_off' : 'search_off'}
          title={state.error ? 'No se pudo cargar la sala' : `No encontramos la sala ${roomId}`}
          description={
            state.error ? 'Revisa tu conexión e inténtalo nuevamente.' : 'Puede que el enlace esté desactualizado.'
          }
        />
      </div>
    )
  }

  const { room, building, schedule } = detail
  const summary = summarizeSchedule(schedule, module)

  return (
    <article aria-labelledby="room-detail-title" className="flex flex-col">
      <header className="flex items-start justify-between gap-2 border-b border-surface-container-high bg-surface-container-low/40 p-space-lg">
        <div className="min-w-0">
          <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-on-primary">
            SECTOR {building.code}
          </span>
          <h2 id="room-detail-title" className="mt-1 text-headline-lg text-primary">
            Sala {room.name}
          </h2>
          <p className="text-body-sm text-outline">
            {building.name} · {formatFloor(room.floor)}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => void toggleFavorite(room.id)}
            aria-pressed={favorite}
            aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            title={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            className={cn(iconButton, favorite ? 'text-amber-500' : 'hover:text-amber-500')}
          >
            <Icon name="bookmark" filled={favorite} className="text-[22px]" />
          </button>
          <button
            type="button"
            onClick={openReport}
            aria-label="Reportar problema"
            title="Reportar problema"
            className={cn(iconButton, 'hover:text-status-busy')}
          >
            <Icon name="flag" className="text-[22px]" />
          </button>
          {closeLink}
        </div>
      </header>

      <div className="space-y-6 p-space-lg">
        <RoomStatusPanel
          {...summary}
          live={live}
          context={`${dayName} · M${module}${moduleInfo ? ` (${formatModuleRange(moduleInfo)})` : ''}`}
        />
        <RoomFeatureGrid room={room} />
        <RoomSchedule schedule={schedule} day={day} dayName={dayName} selectedModule={module} />

        <div className="space-y-2 border-t border-surface-container-high pt-3">
          <button
            type="button"
            onClick={openReport}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded border border-outline-variant px-4 text-body-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="report_problem" className="text-[18px] text-error" />
            Reportar problema en sala {room.name}
          </button>
          <p className="text-center text-[11px] leading-tight text-outline">
            SalasUC no reserva salas. El uso de salas libres es compartido: respeta a docentes,
            ayudantes y personal de aseo.
          </p>
        </div>
      </div>

      <ReportModal open={reportOpen} onClose={() => setReportOpen(false)} roomId={room.id} />
    </article>
  )
}
