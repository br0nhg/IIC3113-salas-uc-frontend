import { useId, type SelectHTMLAttributes } from 'react'
import { cn } from '../../utils/cn'
import FieldLabel from './FieldLabel'
import { fieldClasses } from './fieldStyles'
import Icon from './Icon'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  /** Oculta la etiqueta visualmente (sigue disponible para lectores de pantalla). */
  hideLabel?: boolean
  error?: string
}

export default function Select({
  label,
  hideLabel = false,
  error,
  id,
  className,
  children,
  ...rest
}: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId

  return (
    <div className={className}>
      {hideLabel ? (
        <label htmlFor={selectId} className="sr-only">
          {label}
        </label>
      ) : (
        <FieldLabel htmlFor={selectId}>{label}</FieldLabel>
      )}
      <div className="relative">
        <select
          id={selectId}
          aria-invalid={error ? true : undefined}
          className={fieldClasses(Boolean(error), cn('h-11 appearance-none pr-9 sm:h-10'))}
          {...rest}
        >
          {children}
        </select>
        <Icon
          name="expand_more"
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[18px] text-outline"
        />
      </div>
      {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
    </div>
  )
}
