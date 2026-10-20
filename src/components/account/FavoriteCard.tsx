import { Link, type To } from 'react-router-dom'
import type { RoomSummary } from '../../types'
import { cn } from '../../utils/cn'
import { formatCapacity, formatFloor, STATUS_STYLES, transitionText } from '../rooms/roomPresentation'
import StatusBadge from '../rooms/StatusBadge'
import Icon from '../ui/Icon'

interface FavoriteCardProps {
  roomId: string
  /** Estado actual de la sala; null mientras carga o si la sala ya no existe. */
  summary: RoomSummary | null
  to: To
  onRemove: () => void
}

/** Sala favorita con su estado actual y botón para quitarla. */
export default function FavoriteCard({ roomId, summary, to, onRemove }: FavoriteCardProps) {
  return (
    <div className="relative flex items-start justify-between gap-2 rounded-lg border border-outline-variant/40 bg-surface-container-low/30 p-3 transition-colors hover:border-secondary">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          {/* El enlace cubre toda la tarjeta; el botón de quitar queda por encima. */}
          <Link
            to={to}
            className="text-headline-sm text-primary after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-secondary"
          >
            {roomId}
          </Link>
          {summary && <StatusBadge status={summary.status} />}
        </div>
        {summary ? (
          <>
            <p className="mt-0.5 text-xs text-outline">
              {summary.building.name} · {formatFloor(summary.room.floor)} ·{' '}
              {formatCapacity(summary.room.capacity, 'personas', 'Capacidad sin información')}
            </p>
            <p className={cn('mt-2 text-xs font-medium', STATUS_STYLES[summary.status].text)}>
              {transitionText(summary.status, summary.transition)}
            </p>
          </>
        ) : (
          <p className="mt-0.5 text-xs text-outline">Cargando estado…</p>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Quitar ${roomId} de favoritos`}
        title="Quitar de favoritos"
        className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded text-amber-500 hover:bg-surface-container hover:text-outline sm:size-8"
      >
        <Icon name="star" filled className="text-[20px]" />
      </button>
    </div>
  )
}
