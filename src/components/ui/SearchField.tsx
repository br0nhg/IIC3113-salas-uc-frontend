import { useEffect, useRef } from 'react'
import { cn } from '../../utils/cn'
import Icon from './Icon'

interface SearchFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  /** Enfoca el campo con "/" o Cmd/Ctrl + K. */
  enableShortcut?: boolean
}

function isTypingTarget(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  )
}

/** Campo de búsqueda con ícono, botón para limpiar y atajo de teclado. */
export default function SearchField({
  label,
  value,
  onChange,
  placeholder,
  className,
  enableShortcut = false,
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!enableShortcut) return
    function handleKeyDown(event: KeyboardEvent) {
      const isCmdK = event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)
      const isSlash = event.key === '/' && !isTypingTarget(event.target)
      if (isCmdK || isSlash) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enableShortcut])

  return (
    <div className={cn('relative', className)}>
      <Icon
        name="search"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-outline"
      />
      <input
        ref={inputRef}
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') event.currentTarget.blur()
        }}
        className={cn(
          'h-11 w-full rounded border border-outline-variant/60 bg-surface-container-low pr-10 pl-9 text-body-base text-on-surface sm:h-10',
          'placeholder:text-outline/80 focus:border-secondary focus:ring-2 focus:ring-secondary/30 focus:outline-none',
          '[&::-webkit-search-cancel-button]:hidden',
        )}
      />
      {value ? (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => {
            onChange('')
            inputRef.current?.focus()
          }}
          className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded text-outline hover:text-on-surface"
        >
          <Icon name="close" className="text-[18px]" />
        </button>
      ) : (
        enableShortcut && (
          <kbd className="pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 rounded border border-outline-variant px-1.5 py-0.5 font-sans text-[10px] text-outline md:block">
            /
          </kbd>
        )
      )}
    </div>
  )
}
