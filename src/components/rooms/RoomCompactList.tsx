import { Link, type To } from 'react-router-dom'
import type { RoomSummary } from '../../types'
import { cn } from '../../utils/cn'
import Icon from '../ui/Icon'
import { formatCapacity, STATUS_STYLES, transitionText } from './roomPresentation'
import StatusBadge from './StatusBadge'

interface RoomCompactListProps {
  summaries: RoomSummary[]
  linkTo: (roomId: string) => To
  selectedId?: string
}

/** Vista compacta: lista densa en móvil y tabla en pantallas medianas o mayores. */
export default function RoomCompactList({ summaries, linkTo, selectedId }: RoomCompactListProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest shadow-card">
      {/* Móvil: filas táctiles */}
      <ul className="divide-y divide-surface-container-high md:hidden">
        {summaries.map(({ room, building, status, transition }) => (
          <li key={room.id}>
            <Link
              to={linkTo(room.id)}
              aria-current={room.id === selectedId ? 'true' : undefined}
              className="flex min-h-14 items-center gap-3 px-4 py-2.5 active:bg-surface-container-low"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-headline-sm text-primary">{room.name}</span>
                  <span className="truncate text-body-sm text-outline">
                    {building.name} · {formatCapacity(room.capacity, 'pers.', 'Capacidad sin información')}
                  </span>
                </div>
                <p className={cn('text-body-sm', STATUS_STYLES[status].text)}>
                  {transitionText(status, transition)}
                </p>
              </div>
              <StatusBadge status={status} />
              <Icon name="chevron_right" className="text-outline" />
            </Link>
          </li>
        ))}
      </ul>

      {/* md+: tabla */}
      <table className="hidden w-full text-left text-body-sm md:table">
        <thead className="border-b border-outline-variant/30 bg-surface-container-low text-label-mono text-outline uppercase">
          <tr>
            <th scope="col" className="px-4 py-2.5">Sala</th>
            <th scope="col" className="px-4 py-2.5">Edificio</th>
            <th scope="col" className="px-4 py-2.5">Capacidad</th>
            <th scope="col" className="px-4 py-2.5">Estado</th>
            <th scope="col" className="px-4 py-2.5">Próximo cambio</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container-high">
          {summaries.map(({ room, building, status, transition }) => (
            <tr
              key={room.id}
              className={cn(
                'relative transition-colors hover:bg-surface-container-low/60',
                room.id === selectedId && 'bg-secondary-fixed/40',
              )}
            >
              <td className="px-4 py-2.5">
                {/* El enlace cubre toda la fila */}
                <Link
                  to={linkTo(room.id)}
                  aria-current={room.id === selectedId ? 'true' : undefined}
                  className="font-bold text-primary after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-secondary focus-visible:after:ring-inset"
                >
                  {room.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-outline">{building.name}</td>
              <td className="px-4 py-2.5">{formatCapacity(room.capacity)}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={status} />
              </td>
              <td className={cn('px-4 py-2.5 text-xs', STATUS_STYLES[status].text)}>
                {transitionText(status, transition)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
