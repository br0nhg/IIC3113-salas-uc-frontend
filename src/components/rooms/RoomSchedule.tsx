import type { DayCode, ModuleNumber, ScheduleSlot } from '../../types'
import { cn } from '../../utils/cn'
import { formatModuleRange, isModulePast } from '../../utils/schedule'

interface RoomScheduleProps {
  schedule: ScheduleSlot[]
  day: DayCode
  dayName: string
  selectedModule: ModuleNumber
}

/** Cronograma de la sala por módulo oficial UC; resalta el módulo consultado. */
export default function RoomSchedule({ schedule, day, dayName, selectedModule }: RoomScheduleProps) {
  const first = schedule[0]?.module.number
  const last = schedule[schedule.length - 1]?.module.number

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-label-mono text-outline uppercase">Cronograma {dayName}</h3>
        {first && last && <span className="text-[11px] text-outline">M{first} a M{last}</span>}
      </div>
      <ol className="space-y-1.5 text-xs">
        {schedule.map(({ module, isFree, course }) => {
          const selected = module.number === selectedModule
          const past = isModulePast(module, day)
          return (
            <li
              key={module.number}
              aria-current={selected ? 'true' : undefined}
              className={cn(
                'flex items-center justify-between gap-3 rounded p-2',
                selected
                  ? cn(
                      'border-l-4 font-medium',
                      isFree === true && 'border-status-free bg-status-free-container',
                      isFree === false && 'border-status-busy bg-status-busy-container',
                      isFree === null && 'border-status-nodata bg-status-nodata-container',
                    )
                  : 'border border-outline-variant/40 bg-surface-container-lowest',
                past && !selected && 'border-transparent bg-surface-container-low opacity-60',
              )}
            >
              <div className="flex shrink-0 items-center gap-2">
                <span className="font-bold text-outline">M{module.number}</span>
                <span className="text-on-surface">{formatModuleRange(module)}</span>
              </div>
              <span
                className={cn(
                  'truncate text-right font-medium',
                  isFree === true && 'text-status-free',
                  isFree === false && 'text-status-busy',
                  isFree === null && 'text-status-nodata',
                )}
                title={course?.name}
              >
                {isFree === null
                  ? 'Sin datos'
                  : course
                    ? `${course.code} ${course.name}`
                    : 'Libre'}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
