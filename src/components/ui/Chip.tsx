import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../utils/cn'

type ChipTone = 'primary' | 'accent'

const ACTIVE: Record<ChipTone, string> = {
  primary: 'border-primary bg-primary text-on-primary',
  accent: 'border-secondary/40 bg-secondary-fixed font-bold text-primary',
}

interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  active: boolean
  /** "primary" (navy, selector de sector) o "accent" (azul claro, selector de módulo). */
  tone?: ChipTone
  children: ReactNode
  /** Contador opcional a la derecha (ej. salas libres). */
  count?: number
}

/** Botón seleccionable para filtros horizontales. */
export default function Chip({ active, tone = 'primary', children, count, className, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        'flex min-h-11 shrink-0 items-center gap-1.5 rounded border px-3 text-body-sm whitespace-nowrap transition-colors active:scale-95 sm:min-h-8',
        'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none',
        active
          ? cn(ACTIVE[tone], 'font-semibold')
          : 'border-outline-variant/50 bg-surface-container-lowest font-medium text-on-surface-variant hover:bg-surface-container',
        className,
      )}
      {...rest}
    >
      {children}
      {count !== undefined && (
        <span
          className={cn(
            'rounded-full px-1.5 text-[10px] font-semibold',
            active && tone === 'primary' ? 'bg-primary-container text-on-primary' : 'text-outline',
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
