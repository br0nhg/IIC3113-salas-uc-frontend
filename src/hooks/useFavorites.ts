import { useCallback, useMemo } from 'react'
import { useToast } from '../context/toast-context'
import { addFavorite, getFavorites, removeFavorite } from '../services'
import type { Favorite } from '../types'
import { useAccountData } from './useAccountData'

const without = (list: Favorite[], roomId: string) => list.filter((f) => f.roomId !== roomId)
const withRoom = (list: Favorite[], roomId: string) => [
  { roomId, createdAt: new Date().toISOString() },
  ...without(list, roomId),
]

/** Favoritos del usuario en sesión, con alternado optimista. */
export function useFavorites() {
  const { showToast } = useToast()
  const { data, loading, hasAccount, update } = useAccountData(getFavorites)
  const favorites = useMemo(() => data ?? [], [data])

  const isFavorite = useCallback(
    (roomId: string) => favorites.some((f) => f.roomId === roomId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (roomId: string) => {
      if (!hasAccount) {
        showToast('Inicia sesión con tu cuenta UC para guardar favoritos.', 'info')
        return
      }
      const wasFavorite = favorites.some((f) => f.roomId === roomId)
      update((list) => (wasFavorite ? without(list, roomId) : withRoom(list, roomId)))
      try {
        if (wasFavorite) await removeFavorite(roomId)
        else await addFavorite(roomId)
        showToast(wasFavorite ? `${roomId} quitada de favoritos` : `${roomId} guardada en favoritos`)
      } catch {
        update((list) => (wasFavorite ? withRoom(list, roomId) : without(list, roomId)))
        showToast('No se pudo actualizar tus favoritos.', 'error')
      }
    },
    [favorites, hasAccount, showToast, update],
  )

  return { favorites, loading, isFavorite, toggleFavorite, canUseFavorites: hasAccount }
}
