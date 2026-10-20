import { cn } from '../../utils/cn'

/** Bloque de carga. */
export default function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded bg-surface-container', className)} />
}
