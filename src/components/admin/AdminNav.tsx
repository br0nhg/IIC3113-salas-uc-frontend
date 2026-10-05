import { NavLink } from 'react-router-dom'
import { useLogout } from '../../hooks/useLogout'
import { cn } from '../../utils/cn'
import Icon from '../ui/Icon'

interface AdminNavItem {
  label: string
  icon: string
  /** Sin destino: sección aún no disponible. */
  to?: string
  showReportsBadge?: boolean
}

const MAIN_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', icon: 'dashboard', to: '/admin' },
  { label: 'Salas', icon: 'meeting_room' },
  { label: 'Edificios', icon: 'apartment' },
  { label: 'Usuarios', icon: 'group' },
  { label: 'Reportes', icon: 'flag', showReportsBadge: true },
  { label: 'Sincronización', icon: 'sync_alt' },
]

const itemBase =
  'flex min-h-11 items-center gap-space-sm rounded-lg px-space-md text-body-sm transition-colors md:min-h-10'

interface AdminNavProps {
  openReports: number | null
  /** Se llama al elegir una opción (cierra el menú en móvil). */
  onNavigate?: () => void
}

/** Navegación de la consola: secciones, enlace al sitio y cierre de sesión. */
export default function AdminNav({ openReports, onNavigate }: AdminNavProps) {
  const logout = useLogout()

  return (
    <div className="flex h-full flex-col justify-between gap-6">
      <nav aria-label="Consola de administración" className="space-y-1">
        {MAIN_ITEMS.map((item) => {
          const content = (
            <>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.showReportsBadge && openReports ? (
                <span className="ml-auto rounded-full bg-error px-1.5 text-[10px] font-semibold text-on-error">
                  {openReports}
                </span>
              ) : null}
              {!item.to && !item.showReportsBadge && (
                <span className="ml-auto text-[10px] text-outline">Pronto</span>
              )}
            </>
          )
          return item.to ? (
            <NavLink
              key={item.label}
              to={item.to}
              end
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  itemBase,
                  isActive
                    ? 'bg-surface-container font-semibold text-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
                )
              }
            >
              {content}
            </NavLink>
          ) : (
            <span
              key={item.label}
              aria-disabled="true"
              title="Disponible próximamente"
              className={cn(itemBase, 'cursor-not-allowed text-on-surface-variant/60')}
            >
              {content}
            </span>
          )
        })}
      </nav>

      <div className="space-y-1 border-t border-surface-container-high pt-3">
        <NavLink
          to="/salas"
          onClick={onNavigate}
          className={cn(itemBase, 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface')}
        >
          <Icon name="travel_explore" />
          Ver sitio de usuario
        </NavLink>
        <span
          aria-disabled="true"
          title="Disponible próximamente"
          className={cn(itemBase, 'cursor-not-allowed text-on-surface-variant/60')}
        >
          <Icon name="settings" />
          Ajustes
          <span className="ml-auto text-[10px] text-outline">Pronto</span>
        </span>
        <button
          type="button"
          onClick={() => void logout()}
          className={cn(itemBase, 'w-full text-left text-error hover:bg-error-container/40')}
        >
          <Icon name="logout" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
