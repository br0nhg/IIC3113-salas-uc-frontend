import { useCallback, useEffect, useState } from 'react'
import { hasAccount, useAuth } from '../context/auth-context'

interface LoadedState<T> {
  userId: string
  data: T | null
  error: boolean
}

/**
 * Carga datos propios del usuario con cuenta (historial, reportes…).
 * `load` debe ser estable (ej. una función de servicio importada).
 */
export function useAccountData<T>(load: () => Promise<T>) {
  const { user } = useAuth()
  const userId = hasAccount(user) ? (user?.id ?? null) : null
  const [state, setState] = useState<LoadedState<T> | null>(null)

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    load()
      .then((data) => {
        if (!cancelled) setState({ userId, data, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ userId, data: null, error: true })
      })
    return () => {
      cancelled = true
    }
  }, [load, userId])

  // Lo cargado solo vale para el usuario actual.
  const current = state && state.userId === userId ? state : null

  /** Actualiza localmente los datos ya cargados (ej. tras crear o borrar). */
  const update = useCallback((updater: (data: T) => T) => {
    setState((prev) => (prev?.data ? { ...prev, data: updater(prev.data) } : prev))
  }, [])

  return {
    data: current?.data ?? null,
    loading: userId !== null && !current,
    error: current?.error ?? false,
    hasAccount: userId !== null,
    update,
  }
}
