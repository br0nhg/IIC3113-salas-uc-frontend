import { useEffect, useId, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Icon from './Icon'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  /** Ícono de Material Symbols junto al título. */
  icon?: string
  iconClassName?: string
  children: ReactNode
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Diálogo modal accesible: se cierra con Esc o clic fuera, mantiene el foco
 * dentro y lo devuelve al cerrar. En móvil se muestra como hoja inferior.
 */
export default function Modal({ open, onClose, title, icon, iconClassName, children }: ModalProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const dialog = dialogRef.current
    const focusable = () => Array.from(dialog?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    // Enfoca el primer campo editable; si no hay, el primer elemento enfocable.
    const firstField = dialog?.querySelector<HTMLElement>(
      'input:not([readonly]):not([disabled]), select, textarea',
    )
    ;(firstField ?? focusable()[0])?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [open])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-xs sm:items-center sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="max-h-[92dvh] w-full overflow-y-auto rounded-t-xl border border-outline-variant bg-surface-container-lowest shadow-xl sm:max-w-md sm:rounded-xl"
      >
        <div className="flex items-center justify-between border-b border-surface-container-high bg-surface-container-low/50 px-5 py-3">
          <div className="flex items-center gap-2">
            {icon && <Icon name={icon} className={iconClassName} />}
            <h2 id={titleId} className="text-headline-sm text-primary">
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Cerrar"
            onClick={onClose}
            className="flex size-11 items-center justify-center rounded text-outline hover:text-on-surface sm:size-9"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
