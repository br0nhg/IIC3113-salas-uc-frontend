import { useEffect, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import BottomNav from '../components/layout/BottomNav'
import NoticeBanner from '../components/layout/NoticeBanner'
import TopNav from '../components/layout/TopNav'
import { useCatalog } from '../hooks/useCatalog'
import { getSyncStatus } from '../services'

/** Layout de la app de usuario: barra superior, aviso, contenido y navegación móvil. */
export default function AppLayout() {
  const { catalog } = useCatalog()
  const [lastSyncAt, setLastSyncAt] = useState<string | null>(null)

  useEffect(() => {
    getSyncStatus()
      .then((status) => setLastSyncAt(status.lastSyncAt))
      .catch(() => undefined)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col">
      <TopNav lastSyncAt={lastSyncAt} />
      {catalog && <NoticeBanner modules={catalog.modules} days={catalog.days} />}
      {/* En móvil se reserva espacio para la navegación inferior fija. */}
      <main className="flex flex-1 flex-col pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
      {/* Al abrir el detalle en móvil se parte arriba; al volver se recupera la posición. */}
      <ScrollRestoration getKey={(location) => location.pathname} />
    </div>
  )
}
