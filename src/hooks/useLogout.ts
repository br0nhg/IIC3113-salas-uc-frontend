import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'

/** Cierra sesión, avisa y vuelve a la bienvenida. */
export function useLogout(): () => Promise<void> {
  const { logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  return useCallback(async () => {
    await logout()
    showToast('Sesión cerrada', 'info')
    navigate('/', { replace: true })
  }, [logout, navigate, showToast])
}
