/** Secciones principales de la app de usuario (barra superior y navegación móvil). */
export const NAV_ITEMS = [
  { to: '/salas', label: 'Salas', mobileLabel: 'Buscar', icon: 'search' },
  { to: '/favoritos', label: 'Favoritos', mobileLabel: 'Favoritos', icon: 'bookmark' },
  { to: '/favoritos#historial', label: 'Historial', mobileLabel: 'Historial', icon: 'history' },
] as const

/** Indica si un ítem de navegación corresponde a la ubicación actual. */
export function isNavItemActive(to: string, pathname: string, hash: string): boolean {
  const [path = '', itemHash] = to.split('#')
  if (path === '/salas') return pathname.startsWith('/salas')
  if (pathname !== path) return false
  return itemHash ? hash === `#${itemHash}` : hash !== '#historial'
}
