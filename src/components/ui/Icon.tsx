import { cn } from '../../utils/cn'

interface IconProps {
  /** Nombre del ícono de Material Symbols (ej. "search", "flag"). */
  name: string
  className?: string
  /** Variante rellena del ícono. */
  filled?: boolean
}

/** Ícono decorativo de Material Symbols Outlined. */
export default function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('ms-icon shrink-0', className)}
      style={filled ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 20" } : undefined}
    >
      {name}
    </span>
  )
}
