import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import FieldLabel from './FieldLabel'
import { fieldClasses } from './fieldStyles'
import Icon from './Icon'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  /** Ícono de Material Symbols dentro del campo, a la izquierda. */
  icon?: string
  error?: string
  hint?: string
  labelAction?: ReactNode
}

export default function TextField({
  label,
  icon,
  error,
  hint,
  labelAction,
  id,
  className,
  ...rest
}: TextFieldProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const messageId = `${inputId}-message`
  const message = error ?? hint

  return (
    <div className={className}>
      <FieldLabel htmlFor={inputId} action={labelAction}>
        {label}
      </FieldLabel>
      <div className="relative">
        {icon && (
          <Icon
            name={icon}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
          />
        )}
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? messageId : undefined}
          className={fieldClasses(Boolean(error), cn('h-11 sm:h-10', icon && 'pl-9'))}
          {...rest}
        />
      </div>
      {message && (
        <p
          id={messageId}
          className={cn('mt-1 text-body-sm', error ? 'text-error' : 'text-outline')}
        >
          {message}
        </p>
      )}
    </div>
  )
}
