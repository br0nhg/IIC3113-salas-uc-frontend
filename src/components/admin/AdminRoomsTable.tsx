import { useState } from 'react'
import type { AdminRoomRow, DayCode, ModuleNumber, Room } from '../../types'
import { cn } from '../../utils/cn'
import { formatRelativeTime } from '../../utils/schedule'
import { formatCapacity, STATUS_STYLES, transitionText } from '../rooms/roomPresentation'
import StatusBadge from '../rooms/StatusBadge'
import Button from '../ui/Button'
import ButtonLink from '../ui/ButtonLink'
import EmptyState from '../ui/EmptyState'
import SearchField from '../ui/SearchField'
import Skeleton from '../ui/Skeleton'

interface AdminRoomsTableProps {
  rows: AdminRoomRow[] | null
  error: boolean
  day: DayCode
  module: ModuleNumber
  /** Ej. "Lunes · M4 (12:20 – 13:30)". */
  contextLabel: string
  /** Abre la edición de piso y capacidad de la sala. */
  onEdit: (room: Room) => void
}

/** Tabla de salas por sector con su estado calculado y la antigüedad de sus datos. */
export default function AdminRoomsTable({
  rows,
  error,
  day,
  module,
  contextLabel,
  onEdit,
}: AdminRoomsTableProps) {
  const [filter, setFilter] = useState('')
  const term = filter.trim().toLowerCase()
  const visible = (rows ?? []).filter(
    (row) =>
      !term ||
      row.room.name.toLowerCase().includes(term) ||
      row.building.name.toLowerCase().includes(term),
  )
  const detailUrl = (roomId: string) => `/salas/${encodeURIComponent(roomId)}?dia=${day}&modulo=${module}`

  return (
    <section
      aria-labelledby="admin-rooms-title"
      className="overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container-lowest shadow-card"
    >
      <div className="flex flex-col gap-3 border-b border-surface-container-high bg-surface-container-low/30 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="admin-rooms-title" className="text-headline-sm text-primary">
            Salas por sector
          </h2>
          <p className="text-xs text-outline">Estado calculado para {contextLabel}</p>
        </div>
        <SearchField label="Filtrar salas" placeholder="Filtrar sala o edificio…" value={filter} onChange={setFilter} className="sm:w-64" />
      </div>

      {error ? (
        <EmptyState icon="cloud_off" title="No se pudieron cargar las salas" />
      ) : !rows ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-10" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState icon="search_off" title="Ninguna sala coincide con el filtro" />
      ) : (
        <>
          {/* Móvil: tarjetas */}
          <ul className="divide-y divide-surface-container-high md:hidden">
            {visible.map((row) => (
              <li key={row.room.id} className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary">{row.room.name}</span>
                    <StatusBadge status={row.status} />
                  </div>
                  <p className="text-xs text-outline">
                    {row.building.name} · {formatCapacity(row.room.capacity, 'puestos', 'Capacidad sin información')} · sinc. {formatRelativeTime(row.lastSyncAt)}
                  </p>
                  <p className={cn('text-xs', STATUS_STYLES[row.status].text)}>
                    {transitionText(row.status, row.transition)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(row.room)} aria-label={`Editar ${row.room.name}`}>
                    Editar
                  </Button>
                  <ButtonLink to={detailUrl(row.room.id)} variant="outline" size="sm" aria-label={`Ver detalle de ${row.room.name}`}>
                    Ver
                  </ButtonLink>
                </div>
              </li>
            ))}
          </ul>

          {/* md+: tabla */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-body-sm">
              <thead className="border-b border-outline-variant/30 bg-surface-container-low text-label-mono text-outline uppercase">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Sala</th>
                  <th scope="col" className="px-4 py-2.5">Edificio</th>
                  <th scope="col" className="px-4 py-2.5">Capacidad</th>
                  <th scope="col" className="px-4 py-2.5">Estado calculado</th>
                  <th scope="col" className="px-4 py-2.5">Próximo cambio</th>
                  <th scope="col" className="px-4 py-2.5">Última sinc.</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-high">
                {visible.map((row) => (
                  <tr
                    key={row.room.id}
                    className={cn(
                      'transition-colors hover:bg-surface-container-low/40',
                      row.status === 'nodata' && 'bg-status-soon-container/20',
                    )}
                  >
                    <td className="px-4 py-3 font-bold text-primary">{row.room.name}</td>
                    <td className="px-4 py-3 text-outline">{row.building.name}</td>
                    <td className="px-4 py-3">{formatCapacity(row.room.capacity, 'puestos')}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className={cn('px-4 py-3 text-xs', STATUS_STYLES[row.status].text)}>
                      {transitionText(row.status, row.transition)}
                    </td>
                    <td className="px-4 py-3 text-xs text-outline">{formatRelativeTime(row.lastSyncAt)}</td>
                    <td className="space-x-2 px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-surface-container text-primary hover:bg-surface-container-high"
                        onClick={() => onEdit(row.room)}
                        aria-label={`Editar ${row.room.name}`}
                      >
                        Editar
                      </Button>
                      <ButtonLink
                        to={detailUrl(row.room.id)}
                        variant="ghost"
                        size="sm"
                        className="bg-surface-container text-primary hover:bg-surface-container-high"
                        aria-label={`Ver detalle de ${row.room.name}`}
                      >
                        Ver detalle
                      </ButtonLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  )
}
