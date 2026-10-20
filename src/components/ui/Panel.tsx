import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import Icon from './Icon'

interface PanelProps {
  id?: string
  title: string
  icon?: string
  iconClassName?: string
  /** Contenido a la derecha del título (ej. un botón). */
  action?: ReactNode
  children: ReactNode
  className?: string
}

/** Sección con borde y título, usada en las páginas de cuenta y administración. */
export default function Panel({ id, title, icon, iconClassName, action, children, className }: PanelProps) {
  const titleId = id ? `${id}-title` : undefined
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className={cn(
        'scroll-mt-20 rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-space-md shadow-card md:p-space-lg',
        className,
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 id={titleId} className="flex items-center gap-2 text-headline-sm text-primary">
          {icon && <Icon name={icon} className={iconClassName} />}
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}
