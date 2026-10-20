import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import ButtonLink from '../components/ui/ButtonLink'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/auth-context'
import type { UserRole } from '../types'

interface RequireRoleProps {
  role: UserRole
  children: ReactNode
}

/**
 * Protege una ruta por rol. Sin sesión con cuenta, lleva al inicio de sesión y
 * vuelve después; con otra cuenta, muestra acceso restringido.
 * La API debe validar el rol igualmente: esto solo controla la interfaz.
 */
export default function RequireRole({ role, children }: RequireRoleProps) {
  const { user } = useAuth()
  const location = useLocation()

  if (!user || user.role === 'guest') {
    return <Navigate to="/" replace state={{ from: location.pathname + location.search }} />
  }

  if (user.role !== role) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <EmptyState
          icon="lock"
          title="Acceso restringido"
          description="Esta sección es solo para la administración de SalasUC."
          action={
            <ButtonLink to="/salas" icon="search">
              Ir a buscar salas
            </ButtonLink>
          }
        />
      </div>
    )
  }

  return children
}
