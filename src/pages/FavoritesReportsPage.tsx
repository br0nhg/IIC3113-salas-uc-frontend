import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import FavoritesSection from '../components/account/FavoritesSection'
import HistorySection from '../components/account/HistorySection'
import ReportsSection from '../components/account/ReportsSection'
import ReportModal from '../components/reports/ReportModal'
import Button from '../components/ui/Button'
import ButtonLink from '../components/ui/ButtonLink'
import EmptyState from '../components/ui/EmptyState'
import Icon from '../components/ui/Icon'
import Skeleton from '../components/ui/Skeleton'
import { useAccountData } from '../hooks/useAccountData'
import { useCatalog } from '../hooks/useCatalog'
import { useFavorites } from '../hooks/useFavorites'
import { getMyReports, getRooms } from '../services'
import type { Room } from '../types'

/** Favoritos, historial de consultas y reportes del usuario (/favoritos). */
export default function FavoritesReportsPage() {
  const { catalog } = useCatalog()
  const { hash } = useLocation()
  const favorites = useFavorites()
  const reports = useAccountData(getMyReports)
  const [rooms, setRooms] = useState<Room[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const ready = catalog !== null && reports.hasAccount

  useEffect(() => {
    if (!reports.hasAccount) return
    getRooms()
      .then(setRooms)
      .catch(() => undefined)
  }, [reports.hasAccount])

  // Lleva a la sección del ancla (#historial, #reportes) cuando ya está en pantalla.
  useEffect(() => {
    if (!ready || !hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [ready, hash])

  return (
    <div className="flex-1">
      <header className="flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-lowest px-margin py-3 md:px-margin-tablet md:py-4 lg:px-margin-desktop">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/salas"
            aria-label="Volver a la búsqueda"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container sm:size-9"
          >
            <Icon name="arrow_back" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-headline-sm text-primary md:text-headline-md">Mis favoritos y reportes</h1>
            <p className="hidden text-body-sm text-outline sm:block">
              Tus salas frecuentes, consultas recientes y reportes sobre el estado de las salas.
            </p>
          </div>
        </div>
        {reports.hasAccount && (
          <Button variant="secondary" icon="add_circle" onClick={() => setReportOpen(true)} className="shrink-0">
            <span className="sm:hidden">Reportar</span>
            <span className="hidden sm:inline">Crear reporte rápido</span>
          </Button>
        )}
      </header>

      {!reports.hasAccount ? (
        <EmptyState
          icon="lock"
          title="Inicia sesión para usar tus favoritos"
          description="Con tu cuenta UC puedes guardar salas favoritas, revisar tu historial de consultas y enviar reportes."
          action={
            <div className="flex flex-col gap-2 sm:flex-row">
              <ButtonLink to="/" state={{ from: '/favoritos' }} icon="login">
                Iniciar sesión
              </ButtonLink>
              <ButtonLink to="/registro" variant="outline">
                Crear cuenta
              </ButtonLink>
            </div>
          }
          className="py-16"
        />
      ) : !catalog ? (
        <div className="mx-auto grid w-full max-w-7xl gap-6 p-margin md:p-margin-tablet lg:grid-cols-3 lg:p-margin-desktop">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 p-margin md:p-margin-tablet lg:grid-cols-3 lg:p-margin-desktop">
          <div className="space-y-6 lg:col-span-2">
            <FavoritesSection catalog={catalog} favorites={favorites} />
            <HistorySection catalog={catalog} />
          </div>
          <div className="space-y-6">
            <ReportsSection reports={reports.data} loading={reports.loading} error={reports.error} />
          </div>
        </div>
      )}

      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        rooms={rooms}
        buildings={catalog?.buildings}
        onCreated={(report) => reports.update((list) => [report, ...list])}
      />
    </div>
  )
}
