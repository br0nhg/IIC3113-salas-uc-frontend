import { useId, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export default function Checkbox({ label, id, ...rest }: CheckboxProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  return (
    <label htmlFor={inputId} className="flex min-h-11 items-center gap-2 sm:min-h-0">
      <input
        id={inputId}
        type="checkbox"
        className="size-4 rounded border-outline-variant accent-secondary"
        {...rest}
      />
      <span className="text-body-sm text-on-surface-variant">{label}</span>
    </label>
  )
}
