import type { ReactNode } from 'react'

interface FieldLabelProps {
  htmlFor: string
  children: ReactNode
  /** Contenido alineado a la derecha de la etiqueta (ej. un enlace). */
  action?: ReactNode
}

/** Etiqueta de campo en estilo label-mono, compartida por inputs, selects y textareas. */
export default function FieldLabel({ htmlFor, children, action }: FieldLabelProps) {
  return (
    <div className="mb-1 flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-label-mono uppercase text-outline">
        {children}
      </label>
      {action}
    </div>
  )
}
