import { Link, type To } from 'react-router-dom'
import type { RoomSummary } from '../../types'
import { cn } from '../../utils/cn'
import Icon from '../ui/Icon'
import { FEATURE_INFO, STATUS_STYLES, transitionIcon, transitionText } from './roomPresentation'
import StatusBadge from './StatusBadge'

interface RoomCardProps {
  summary: RoomSummary
  to: To
  selected?: boolean
}

/** Tarjeta de sala con estado, capacidad, recursos o clase en curso y próximo cambio. */
export default function RoomCard({ summary, to, selected = false }: RoomCardProps) {
  const { room, building, status, course, transition } = summary
  const style = STATUS_STYLES[status]
  const resources = room.features
    .filter((feature) => feature !== 'wifi')
    .map((feature) => FEATURE_INFO[feature].label)
    .join(' • ')

  return (
    <Link
      to={to}
      aria-current={selected ? 'true' : undefined}
      className={cn(
        'group flex flex-col rounded-lg bg-surface-container-lowest p-space-md shadow-card transition-all md:p-space-lg',
        'hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none',
        selected
          ? 'border-2 border-secondary'
          : 'border border-outline-variant/40 hover:border-outline-variant',
        status === 'nodata' && 'opacity-90',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span
            className={cn(
              'text-[11px] font-semibold tracking-wider uppercase',
              selected ? 'text-secondary' : 'text-outline',
            )}
          >
            {building.name}
          </span>
          <h2 className="text-headline-md text-primary transition-colors group-hover:text-secondary">
            {room.name}
          </h2>
          <p className="text-body-sm text-outline">Piso {room.floor}</p>
        </div>
        <StatusBadge status={status} />
      </div>

      <dl className="space-y-2 border-y border-surface-container-high py-2 text-body-sm">
        <div className="flex items-center justify-between gap-3 text-outline">
          <dt className="flex items-center gap-1.5">
            <Icon name="group" className="text-[16px]" /> Capacidad
          </dt>
          <dd className="font-medium text-on-surface">{room.capacity} personas</dd>
        </div>
        <div className="flex items-center justify-between gap-3 text-outline">
          {course ? (
            <>
              <dt className="flex shrink-0 items-center gap-1.5">
                <Icon name="school" className="text-[16px]" /> Clase
              </dt>
              <dd className="truncate text-xs font-medium text-on-surface" title={course.name}>
                {course.code} {course.name}
              </dd>
            </>
          ) : (
            <>
              <dt className="flex shrink-0 items-center gap-1.5">
                <Icon name="devices" className="text-[16px]" /> Recursos
              </dt>
              <dd className="truncate text-xs font-medium text-on-surface" title={resources}>
                {resources || 'Sin información'}
              </dd>
            </>
          )}
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2">
        <p className={cn('flex items-center gap-1 text-body-sm font-semibold', style.text)}>
          <Icon name={transitionIcon(status)} className="text-[16px]" />
          {transitionText(status, transition)}
        </p>
        <span className="flex shrink-0 items-center text-xs font-semibold text-secondary transition-transform group-hover:translate-x-0.5">
          Ver detalle
          <Icon name="arrow_forward" className="text-[14px]" />
        </span>
      </div>
    </Link>
  )
}
