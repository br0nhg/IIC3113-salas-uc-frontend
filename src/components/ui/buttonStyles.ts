import { cn } from '../../utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'icon'

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary/90',
  secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-primary hover:bg-surface-container',
  ghost: 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
  danger: 'bg-error text-on-error hover:bg-error/90',
}

// En móvil los objetivos táctiles miden al menos 44 px (DESIGN.md).
const SIZES: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3 text-body-sm',
  md: 'min-h-11 px-4 text-body-sm sm:min-h-10',
  icon: 'size-11 sm:size-9',
}

export interface ButtonStyleOptions {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
}

/** Clases compartidas por Button y ButtonLink. */
export function buttonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded font-semibold transition-all active:scale-[0.98]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    fullWidth && 'w-full',
    className,
  )
}
