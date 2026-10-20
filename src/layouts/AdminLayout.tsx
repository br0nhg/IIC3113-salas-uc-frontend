import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import AdminBrand from '../components/admin/AdminBrand'
import AdminNav from '../components/admin/AdminNav'
import Icon from '../components/ui/Icon'
import { getAdminMetrics } from '../services'

/** Layout de la consola: barra lateral en md+, menú desplegable en móvil. */
export default function AdminLayout() {
  const [openReports, setOpenReports] = useState<number | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    getAdminMetrics()
      .then((metrics) => setOpenReports(metrics.openReports))
      .catch(() => undefined)
  }, [])

  // El menú móvil se cierra con Esc y bloquea el scroll de fondo.
  useEffect(() => {
    if (!menuOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [menuOpen])

  return (
    <div className="flex min-h-dvh bg-background">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-6 border-r border-outline-variant/30 bg-surface-container-lowest p-space-md md:flex">
        <div className="px-2 py-1">
          <AdminBrand />
        </div>
        <div className="flex-1">
          <AdminNav openReports={openReports} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-outline-variant/30 bg-surface-container-lowest/90 px-margin backdrop-blur-md md:hidden">
          <AdminBrand />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            className="flex size-11 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container"
          >
            <Icon name="menu" />
          </button>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} aria-hidden="true" />
          <div
            id="admin-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de la consola"
            className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-6 bg-surface-container-lowest p-space-md shadow-xl"
          >
            <div className="flex items-center justify-between">
              <AdminBrand />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Cerrar menú"
                autoFocus
                className="flex size-11 items-center justify-center rounded-lg text-outline hover:bg-surface-container"
              >
                <Icon name="close" />
              </button>
            </div>
            <div className="flex-1">
              <AdminNav openReports={openReports} onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
