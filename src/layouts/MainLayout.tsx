import { Link, Outlet } from 'react-router-dom'

export default function MainLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-10 bg-blue-900 text-white shadow">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold tracking-tight">
            SalasUC
          </Link>
          <span className="text-xs text-blue-200 sm:text-sm">Ingeniería UC</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <Outlet />
      </main>

      <footer className="px-4 py-4 text-center text-xs text-slate-500">
        Datos obtenidos de BuscaCursos UC
      </footer>
    </div>
  )
}
