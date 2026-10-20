import type { ReactNode } from 'react'

interface ChipGroupProps {
  label: string
  children: ReactNode
}

/** Fila de chips con etiqueta; en móvil se desplaza horizontalmente hasta el borde. */
export default function ChipGroup({ label, children }: ChipGroupProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className="custom-scroll -mx-margin flex items-center gap-1.5 overflow-x-auto px-margin pb-1 md:mx-0 md:px-0"
    >
      <span aria-hidden="true" className="mr-1 shrink-0 text-label-mono text-outline uppercase">
        {label}:
      </span>
      {children}
    </div>
  )
}
