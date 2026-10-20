import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import Icon from './Icon'

interface EmptyStateProps {
  icon: string
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/** Mensaje para listas vacías, errores o secciones sin seleccionar. */
export default function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-2 px-4 py-10 text-center', className)}>
      <Icon name={icon} className="text-[32px] text-outline-variant" />
      <p className="text-headline-sm text-on-surface">{title}</p>
      {description && <p className="max-w-sm text-body-sm text-outline">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
