import { Link, useLocation } from 'react-router-dom'
import { hasAccount, useAuth } from '../../context/auth-context'
import { useLogout } from '../../hooks/useLogout'
import { cn } from '../../utils/cn'
import { formatRelativeTime } from '../../utils/schedule'
import ButtonLink from '../ui/ButtonLink'
import Icon from '../ui/Icon'
import Logo from '../ui/Logo'
import { isNavItemActive, NAV_ITEMS } from './navItems'

interface TopNavProps {
  /** Fecha ISO de la última actualización desde BuscaCursos. */
  lastSyncAt: string | null
}

/** Barra superior fija y translúcida de la app de usuario. */
export default function TopNav({ lastSyncAt }: TopNavProps) {
  const { user } = useAuth()
  const logout = useLogout()
  const { pathname, hash } = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/30 bg-surface-container-lowest/85 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-margin md:px-margin-tablet lg:px-margin-desktop">
        <Logo to="/salas" />

        <nav aria-label="Principal" className="hidden h-full items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isNavItemActive(item.to, pathname, hash)
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full items-center border-b-2 text-label-mono transition-colors',
                  active
                    ? 'border-secondary text-secondary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          {lastSyncAt && (
            <span className="hidden items-center gap-1.5 text-xs text-outline xl:flex">
              <span className="size-2 animate-pulse-dot rounded-full bg-status-free-dot" />
              Actualizado {formatRelativeTime(lastSyncAt)}
            </span>
          )}
          {hasAccount(user) ? (
            <div className="flex items-center gap-1">
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="mr-2 flex min-h-11 items-center gap-1 rounded px-2 text-label-mono text-secondary hover:bg-surface-container sm:min-h-9"
                >
                  <Icon name="dashboard" className="text-[18px]" />
                  <span className="hidden sm:inline">Consola</span>
                </Link>
              )}
              <span className="hidden max-w-40 truncate text-body-sm font-medium text-on-surface sm:inline">
                {user?.name}
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                aria-label="Cerrar sesión"
                title="Cerrar sesión"
                className="flex size-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container sm:size-9"
              >
                <Icon name="logout" />
              </button>
            </div>
          ) : (
            // En móvil el acceso está en la navegación inferior.
            <div className="hidden sm:block">
              <ButtonLink to="/" size="sm" icon="person">
                Acceso UC
              </ButtonLink>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
