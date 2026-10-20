import type { Day, TimeModule } from '../../types'
import { formatModuleRange, getCurrentSlot } from '../../utils/schedule'
import Icon from '../ui/Icon'

interface NoticeBannerProps {
  modules: TimeModule[]
  days: Day[]
}

/** Aviso de que la información no constituye reserva, más el módulo actual. */
export default function NoticeBanner({ modules, days }: NoticeBannerProps) {
  const now = getCurrentSlot(modules)
  const module = now && modules.find((m) => m.number === now.module)
  const dayName = now && days.find((d) => d.code === now.day)?.name

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-outline-variant/30 bg-surface-container-high/60 px-margin py-2 text-body-sm md:px-margin-tablet lg:px-margin-desktop">
      <p className="flex items-start gap-2 text-on-surface">
        <Icon name="info" className="mt-px text-[18px] text-secondary" />
        <span>
          <strong>Aviso:</strong>{' '}
          <span className="hidden sm:inline">
            información basada en la programación oficial de BuscaCursos UC.{' '}
          </span>
          <strong>No constituye reserva</strong> ni garantiza que la sala esté desocupada.
        </span>
      </p>
      {now && module && (
        <p className="text-label-mono text-primary">
          {now.inProgress
            ? `Módulo actual: M${module.number} (${formatModuleRange(module)})`
            : `Próximo módulo: ${dayName ?? ''} M${module.number} (${module.start})`}
        </p>
      )}
    </div>
  )
}
