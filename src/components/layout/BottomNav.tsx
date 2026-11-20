import { Link, useLocation } from 'react-router-dom'
import { hasAccount, useAuth } from '../../context/auth-context'
import { cn } from '../../utils/cn'
import Icon from '../ui/Icon'
import { isNavItemActive, NAV_ITEMS } from './navItems'

const itemClass =
  'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-badge-status transition-colors'

/** Navegación inferior fija para móvil. */
export default function BottomNav() {
  const { user } = useAuth()
  const { pathname, hash } = useLocation()

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 flex border-t border-outline-variant/30 bg-surface-container-lowest/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavItemActive(item.to, pathname, hash)
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className={cn(itemClass, active ? 'text-secondary' : 'text-on-surface-variant')}
          >
            <Icon name={item.icon} filled={active} className="text-[22px]" />
            {item.mobileLabel}
          </Link>
        )
      })}
      {hasAccount(user) ? (
        <Link
          to="/cuenta"
          aria-current={pathname === '/cuenta' ? 'page' : undefined}
          className={cn(itemClass, pathname === '/cuenta' ? 'text-secondary' : 'text-on-surface-variant')}
        >
          <Icon name="account_circle" filled={pathname === '/cuenta'} className="text-[22px]" />
          Cuenta
        </Link>
      ) : (
        <Link to="/" className={cn(itemClass, 'text-on-surface-variant')}>
          <Icon name="person" className="text-[22px]" />
          Acceder
        </Link>
      )}
    </nav>
  )
}
