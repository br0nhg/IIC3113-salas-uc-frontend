import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Catalog } from '../../hooks/useCatalog'
import type { useFavorites } from '../../hooks/useFavorites'
import { getRoomSummaries } from '../../services'
import type { RoomSummary } from '../../types'
import { getCurrentSlot } from '../../utils/schedule'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Panel from '../ui/Panel'
import Skeleton from '../ui/Skeleton'
import FavoriteCard from './FavoriteCard'

interface FavoritesSectionProps {
  catalog: Catalog
  favorites: ReturnType<typeof useFavorites>
}

interface SummariesState {
  key: string
  summaries: RoomSummary[]
}

/** Salas favoritas con su estado en el módulo actual. */
export default function FavoritesSection({ catalog, favorites }: FavoritesSectionProps) {
  const now = getCurrentSlot(catalog.modules)
  const day = now?.day ?? 'L'
  const module = now?.module ?? 1
  const slotKey = `${day}-${module}`
  const [state, setState] = useState<SummariesState | null>(null)

  useEffect(() => {
    let cancelled = false
    getRoomSummaries({ day, module })
      .then((summaries) => {
        if (!cancelled) setState({ key: `${day}-${module}`, summaries })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [day, module])

  const summaries = state?.key === slotKey ? state.summaries : []
  const list = favorites.favorites
  const dayName = catalog.days.find((d) => d.code === day)?.name

  return (
    <Panel
      id="favoritos"
      title={`Salas favoritas${favorites.loading ? '' : ` (${list.length})`}`}
      icon="star"
      iconClassName="text-amber-500"
      action={
        now && (
          <span className="text-label-mono text-outline">
            {now.inProgress ? 'Estado ahora' : `Estado ${dayName ?? ''}`} · M{module}
          </span>
        )
      }
    >
      {favorites.loading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : list.length === 0 ? (
        <EmptyState
          icon="bookmark_add"
          title="Aún no tienes salas favoritas"
          description="Guarda una sala desde su detalle con el ícono de marcador para verla aquí."
          action={
            <Link to="/salas" className="text-body-sm font-semibold text-secondary hover:underline">
              Buscar salas
            </Link>
          }
          className="py-6"
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {list.map(({ roomId }) => (
            <FavoriteCard
              key={roomId}
              roomId={roomId}
              summary={summaries.find((s) => s.room.id === roomId) ?? null}
              to={`/salas/${encodeURIComponent(roomId)}`}
              onRemove={() => void favorites.toggleFavorite(roomId)}
            />
          ))}
          <Link
            to="/salas"
            className="flex min-h-24 flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/60 p-3 text-center text-outline transition-colors hover:border-secondary hover:text-secondary"
          >
            <Icon name="bookmark_add" className="text-[20px]" />
            <span className="mt-1 text-xs font-medium">Añadir otra sala</span>
          </Link>
        </div>
      )}
    </Panel>
  )
}
