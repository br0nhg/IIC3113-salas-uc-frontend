import type { Building, TimeModule } from '../../types'
import { cn } from '../../utils/cn'
import Icon from '../ui/Icon'

const PILLARS = [
  {
    icon: 'event_busy',
    title: 'Sin reservas',
    text: 'Plataforma informativa: consultas qué salas están libres, sin trámites ni agendamientos.',
  },
  {
    icon: 'sync_saved_locally',
    title: 'Datos de BuscaCursos',
    text: 'La disponibilidad se basa en la programación oficial publicada en BuscaCursos UC.',
  },
]

interface HeroPillarsProps {
  buildings: Building[]
  modules: TimeModule[]
  className?: string
}

/** Pilares del producto y resumen de sectores y módulos cubiertos. */
export default function HeroPillars({ buildings, modules, className }: HeroPillarsProps) {
  const first = modules[0]
  const last = modules[modules.length - 1]

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        {PILLARS.map((pillar) => (
          <div
            key={pillar.title}
            className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-3.5 shadow-card"
          >
            <Icon name={pillar.icon} className="mb-1 text-xl text-secondary" />
            <h2 className="text-headline-sm text-primary">{pillar.title}</h2>
            <p className="mt-1 text-body-sm text-outline">{pillar.text}</p>
          </div>
        ))}
      </div>
      {buildings.length > 0 && first && last && (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-label-mono text-outline">
          <span>Sectores: {buildings.map((b) => b.code).join(' • ')}</span>
          <span aria-hidden="true">•</span>
          <span>
            Módulos {first.number} al {last.number} ({first.start}–{last.end})
          </span>
        </p>
      )}
    </div>
  )
}
