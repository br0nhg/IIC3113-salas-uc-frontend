import { useId, type TextareaHTMLAttributes } from 'react'
import FieldLabel from './FieldLabel'
import { fieldClasses } from './fieldStyles'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
}

export default function Textarea({ label, error, id, className, ...rest }: TextareaProps) {
  const autoId = useId()
  const textareaId = id ?? autoId

  return (
    <div className={className}>
      <FieldLabel htmlFor={textareaId}>{label}</FieldLabel>
      <textarea
        id={textareaId}
        aria-invalid={error ? true : undefined}
        className={fieldClasses(Boolean(error), 'py-2')}
        {...rest}
      />
      {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
    </div>
  )
}
