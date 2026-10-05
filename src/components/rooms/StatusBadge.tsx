import type { RoomStatus } from '../../types'
import { cn } from '../../utils/cn'
import { STATUS_STYLES } from './roomPresentation'

interface StatusBadgeProps {
  status: RoomStatus
  className?: string
}

/** Badge de estado de sala con punto indicador (pulsa en estados libres). */
export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status]
  return (
    <span
      className={cn(
        'inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-md border px-2 text-badge-status whitespace-nowrap uppercase',
        style.badge,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', style.dot, style.pulse && 'animate-pulse-dot')} />
      {style.label}
    </span>
  )
}
