import type { CourseOccupancy, RoomStatus, StatusTransition } from '../../types'
import { cn } from '../../utils/cn'
import { STATUS_STYLES, transitionText } from './roomPresentation'

interface RoomStatusPanelProps {
  status: RoomStatus
  course: CourseOccupancy | null
  transition: StatusTransition | null
  /** Contexto de la consulta, ej. "Lunes · M4 (12:20 – 13:30)". */
  context: string
  /** true si el módulo consultado es el que está en curso ahora. */
  live: boolean
}

/** Recuadro destacado con el estado de la sala en el módulo consultado. */
export default function RoomStatusPanel({ status, course, transition, context, live }: RoomStatusPanelProps) {
  const style = STATUS_STYLES[status]

  return (
    <div className={cn('rounded-lg border p-3.5', style.panel)}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className={cn('text-label-mono uppercase', style.text)}>
          {live ? 'Estado ahora' : 'Estado consultado'}
        </span>
        <span className={cn('flex items-center gap-1 text-[11px]', style.text)}>
          <span className={cn('size-2 rounded-full', style.dot, live && 'animate-pulse-dot')} />
          {context}
        </span>
      </div>
      <p className={cn('text-headline-md uppercase', style.text)}>{style.label}</p>
      <p className={cn('mt-1 text-body-sm', style.text)}>
        {course && (
          <>
            Clase: <strong>{course.code}{course.section !== null && `-${course.section}`}</strong> {course.name}.{' '}
          </>
        )}
        {status === 'nodata'
          ? 'No hay información de BuscaCursos para este módulo; verifica en la sala.'
          : `${transitionText(status, transition)}.`}
      </p>
    </div>
  )
}
