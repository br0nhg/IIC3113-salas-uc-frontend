import { cn } from '../../utils/cn'

/** Clases base de inputs, selects y textareas. */
export function fieldClasses(hasError: boolean, className?: string): string {
  return cn(
    'w-full rounded border bg-surface-container-lowest px-3 text-body-base text-on-surface',
    'placeholder:text-outline/70 focus:outline-none focus:ring-2 transition-colors',
    'disabled:bg-surface-container-low disabled:text-outline',
    hasError
      ? 'border-error focus:border-error focus:ring-error/30'
      : 'border-outline-variant focus:border-secondary focus:ring-secondary/30',
    className,
  )
}
