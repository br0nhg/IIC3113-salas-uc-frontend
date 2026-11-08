import { useEffect, useState } from 'react'
import { getWeeklySchedule } from '../services'
import type { WeeklySchedule } from '../types'

interface LoadedState {
  /** Salas cargadas, en el formato de la clave (ids unidos por coma). */
  key: string
  schedules: WeeklySchedule[]
  error: boolean
}

const toKey = (roomIds: string[]) => [...roomIds].sort().join(',')

/** Horario semanal de varias salas (ej. las favoritas), cargado en paralelo. */
export function useWeeklySchedules(roomIds: string[]) {
  const [state, setState] = useState<LoadedState | null>(null)
  const key = toKey(roomIds)

  // Quitar una sala no requiere recargar: basta con que lo ya cargado la incluya.
  const loadedIds = state ? new Set(state.key.split(',')) : null
  const covered = loadedIds !== null && roomIds.every((id) => loadedIds.has(id))
  const loadKey = covered && state ? state.key : key

  useEffect(() => {
    if (!loadKey) return
    let cancelled = false
    Promise.all(loadKey.split(',').map((id) => getWeeklySchedule(id)))
      .then((list) => {
        const schedules = list.filter((s): s is WeeklySchedule => s !== null)
        if (!cancelled) setState({ key: loadKey, schedules, error: false })
      })
      .catch(() => {
        if (!cancelled) setState({ key: loadKey, schedules: [], error: true })
      })
    return () => {
      cancelled = true
    }
  }, [loadKey])

  const current = state?.key === loadKey && loadKey !== '' ? state : null
  const wanted = new Set(roomIds)

  return {
    schedules: current ? current.schedules.filter((s) => wanted.has(s.room.id)) : [],
    loading: loadKey !== '' && !current,
    error: current?.error ?? false,
  }
}
