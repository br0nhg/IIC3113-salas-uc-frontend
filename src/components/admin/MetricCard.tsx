import type { ReactNode } from 'react'
import Skeleton from '../ui/Skeleton'

interface MetricCardProps {
  label: string
  /** null mientras carga. */
  value: string | null
  footnote?: ReactNode
}

/** Indicador numérico del dashboard. */
export default function MetricCard({ label, value, footnote }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-4 shadow-card">
      <div className="text-label-mono tracking-wider text-outline uppercase">{label}</div>
      {value === null ? (
        <Skeleton className="mt-2 h-10 w-28" />
      ) : (
        <div className="mt-1 text-display-hero-mobile text-primary md:text-display-hero">{value}</div>
      )}
      {footnote && <div className="mt-1 text-xs font-medium">{footnote}</div>}
    </div>
  )
}
