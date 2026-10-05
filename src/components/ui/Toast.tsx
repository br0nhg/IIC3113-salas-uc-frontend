import type { ToastVariant } from '../../context/toast-context'
import { cn } from '../../utils/cn'
import Icon from './Icon'

const ICONS: Record<ToastVariant, { name: string; className: string }> = {
  success: { name: 'check_circle', className: 'text-tertiary-fixed-dim' },
  info: { name: 'info', className: 'text-inverse-primary' },
  error: { name: 'error', className: 'text-error-container' },
}

interface ToastProps {
  message: string
  variant: ToastVariant
  visible: boolean
}

/** Notificación flotante. Se renderiza siempre para que el aria-live anuncie los cambios. */
export default function Toast({ message, variant, visible }: ToastProps) {
  const icon = ICONS[variant]

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'pointer-events-none fixed inset-x-4 bottom-20 z-[60] flex justify-center transition-all duration-200',
        'md:inset-x-auto md:right-4 md:bottom-4',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      {message && (
        <div className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm text-on-primary shadow-lg">
          <Icon name={icon.name} className={cn('text-[18px]', icon.className)} />
          <span>{message}</span>
        </div>
      )}
    </div>
  )
}
