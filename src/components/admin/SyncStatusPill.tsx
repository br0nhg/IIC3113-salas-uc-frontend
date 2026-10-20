import { cn } from '../../utils/cn'
import { formatRelativeTime } from '../../utils/schedule'

interface SyncStatusPillProps {
  lastSyncAt: string | null
  syncing: boolean
}

/** Estado de la última actualización de datos desde BuscaCursos. */
export default function SyncStatusPill({ lastSyncAt, syncing }: SyncStatusPillProps) {
  return (
    <div
      aria-live="polite"
      className="flex items-center gap-2.5 rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-3 py-1.5"
    >
      <span
        className={cn(
          'size-2.5 rounded-full',
          syncing ? 'animate-pulse-dot bg-status-soon-dot' : 'animate-pulse-dot bg-status-free-dot',
        )}
      />
      <div>
        <div className="text-[11px] text-outline">Datos de BuscaCursos</div>
        <div className={cn('text-xs font-semibold', syncing ? 'text-status-soon' : 'text-status-free')}>
          {syncing
            ? 'Sincronizando…'
            : lastSyncAt
              ? `Sincronizado ${formatRelativeTime(lastSyncAt)}`
              : 'Consultando…'}
        </div>
      </div>
    </div>
  )
}
