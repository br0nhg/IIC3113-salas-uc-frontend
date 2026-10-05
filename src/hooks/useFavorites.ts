import { useCallback, useEffect, useMemo, useState } from 'react'
import { hasAccount, useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { addFavorite, getFavorites, removeFavorite } from '../services'
import type { Favorite } from '../types'

interface FavoritesState {
  /** Usuario para el que se cargaron los favoritos. */
  userId: string | null
  favorites: Favorite[]
}

/** Favoritos del usuario en sesión, con alternado optimista. */
export function useFavorites() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const userId = hasAccount(user) ? (user?.id ?? null) : null
  const [state, setState] = useState<FavoritesState>({ userId: null, favorites: [] })

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    getFavorites()
      .then((favorites) => {
        if (!cancelled) setState({ userId, favorites })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [userId])

  // Si cambió el usuario, los favoritos cargados ya no aplican.
  const favorites = useMemo(
    () => (userId && state.userId === userId ? state.favorites : []),
    [state, userId],
  )
  const loading = userId !== null && state.userId !== userId

  const isFavorite = useCallback(
    (roomId: string) => favorites.some((f) => f.roomId === roomId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (roomId: string) => {
      if (!userId) {
        showToast('Inicia sesión con tu cuenta UC para guardar favoritos.', 'info')
        return
      }
      const wasFavorite = favorites.some((f) => f.roomId === roomId)
      const previous = favorites
      setState({
        userId,
        favorites: wasFavorite
          ? favorites.filter((f) => f.roomId !== roomId)
          : [{ roomId, createdAt: new Date().toISOString() }, ...favorites],
      })
      try {
        if (wasFavorite) await removeFavorite(roomId)
        else await addFavorite(roomId)
        showToast(wasFavorite ? `${roomId} quitada de favoritos` : `${roomId} guardada en favoritos`)
      } catch {
        setState({ userId, favorites: previous })
        showToast('No se pudo actualizar tus favoritos.', 'error')
      }
    },
    [favorites, showToast, userId],
  )

  return { favorites, loading, isFavorite, toggleFavorite, canUseFavorites: userId !== null }
}
