import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'
import Icon from './Icon'

type AlertVariant = 'info' | 'error'

const STYLES: Record<AlertVariant, { box: string; icon: string; iconName: string }> = {
  info: { box: 'bg-surface-container text-on-surface-variant', icon: 'text-secondary', iconName: 'info' },
  error: { box: 'bg-error-container text-on-error-container', icon: 'text-error', iconName: 'error' },
}

interface AlertProps {
  variant?: AlertVariant
  children: ReactNode
  className?: string
}

/** Mensaje en línea (informativo o de error). */
export default function Alert({ variant = 'info', children, className }: AlertProps) {
  const style = STYLES[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={cn('flex items-start gap-2 rounded p-2.5 text-body-sm', style.box, className)}
    >
      <Icon name={style.iconName} className={cn('mt-px text-[16px]', style.icon)} />
      <div>{children}</div>
    </div>
  )
}
