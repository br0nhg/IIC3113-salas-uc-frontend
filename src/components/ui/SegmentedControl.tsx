import { cn } from '../../utils/cn'
import Icon from './Icon'

export interface SegmentOption<T extends string> {
  value: T
  label: string
  icon?: string
}

interface SegmentedControlProps<T extends string> {
  label: string
  options: SegmentOption<T>[]
  value: T
  onChange: (value: T) => void
}

/** Selector de opciones excluyentes (ej. Tarjetas / Compacto). */
export default function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      aria-label={label}
      className="flex rounded border border-outline-variant/50 bg-surface-container p-0.5"
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex min-h-10 items-center gap-1 rounded px-2.5 text-body-sm transition-colors sm:min-h-8',
              'focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none',
              active
                ? 'bg-surface-container-lowest font-semibold text-primary shadow-card'
                : 'font-medium text-outline hover:text-on-surface',
            )}
          >
            {option.icon && <Icon name={option.icon} className="text-[16px]" />}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
