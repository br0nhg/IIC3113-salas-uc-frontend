import { useCallback, useSyncExternalStore } from 'react'

/** true mientras la media query se cumple (ej. "(min-width: 1024px)"). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', onChange)
      return () => media.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

/** Breakpoint lg de Tailwind: el detalle de sala se muestra como panel lateral. */
export const DESKTOP_QUERY = '(min-width: 1024px)'
