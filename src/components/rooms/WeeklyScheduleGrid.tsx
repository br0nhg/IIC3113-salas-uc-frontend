import type { ReactNode } from 'react'
import type { Day, DayCode, TimeModule } from '../../types'
import { cn } from '../../utils/cn'
import { isModulePast, type CurrentSlot } from '../../utils/schedule'

export interface WeeklyCellContext {
  /** Es el módulo "ahora" (en curso o el próximo en empezar). */
  isNow: boolean
  /** Módulo de hoy que ya terminó. */
  past: boolean
}

interface WeeklyScheduleGridProps {
  days: Day[]
  modules: TimeModule[]
  now: CurrentSlot | null
  /** Texto para lectores de pantalla (ej. "Horario semanal de B12"). */
  caption: string
  /** Contenido de cada celda; debe ocupar todo el ancho (ej. un enlace o botón). */
  renderCell: (day: Day, module: TimeModule, context: WeeklyCellContext) => ReactNode
}

/**
 * Grilla semanal: días (columnas) por módulos UC (filas). Marca el día y el
 * módulo "ahora" y atenúa los módulos de hoy que ya pasaron.
 */
export default function WeeklyScheduleGrid({ days, modules, now, caption, renderCell }: WeeklyScheduleGridProps) {
  const isToday = (code: DayCode) => now?.day === code

  return (
    <div className="custom-scroll overflow-x-auto">
      <table className="w-full min-w-[17.5rem] table-fixed border-separate border-spacing-1 text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            <th scope="col" className="w-11 md:w-24">
              <span className="sr-only">Módulo</span>
            </th>
            {days.map((day) => (
              <th
                key={day.code}
                scope="col"
                aria-current={isToday(day.code) ? 'date' : undefined}
                className={cn(
                  'rounded py-1 font-semibold',
                  isToday(day.code) ? 'bg-primary text-on-primary' : 'text-outline',
                )}
              >
                <abbr title={day.name} className="no-underline">
                  {day.shortName}
                </abbr>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {modules.map((module) => {
            const currentRow = now?.module === module.number
            return (
              <tr key={module.number}>
                <th
                  scope="row"
                  className={cn(
                    'rounded px-1 text-left font-bold',
                    currentRow ? 'bg-secondary-fixed text-primary' : 'text-outline',
                  )}
                >
                  M{module.number}
                  <span className="hidden font-normal md:inline"> {module.start}</span>
                </th>
                {days.map((day) => {
                  const isNow = isToday(day.code) && currentRow
                  const past = isModulePast(module, day.code)
                  return (
                    <td key={day.code} aria-current={isNow ? 'time' : undefined} className="p-0">
                      <div
                        className={cn(
                          'rounded',
                          isNow && 'ring-2 ring-secondary ring-offset-1',
                          past && 'opacity-50',
                        )}
                      >
                        {renderCell(day, module, { isNow, past })}
                      </div>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
