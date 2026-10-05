import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, type To } from 'react-router-dom'
import RoomCard from '../components/rooms/RoomCard'
import RoomCompactList from '../components/rooms/RoomCompactList'
import RoomDetailPanel from '../components/rooms/RoomDetailPanel'
import RoomFilters from '../components/rooms/RoomFilters'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Icon from '../components/ui/Icon'
import SegmentedControl from '../components/ui/SegmentedControl'
import Skeleton from '../components/ui/Skeleton'
import Spinner from '../components/ui/Spinner'
import { useCatalog, type Catalog } from '../hooks/useCatalog'
import { DESKTOP_QUERY, useMediaQuery } from '../hooks/useMediaQuery'
import { useSearchFilters } from '../hooks/useSearchFilters'
import { addHistoryEntry, getRoomSummaries } from '../services'
import type { BuildingCode, RoomSummary } from '../types'
import { cn } from '../utils/cn'
import type { ViewMode } from '../utils/searchParams'

const VIEW_OPTIONS = [
  { value: 'cards' as const, label: 'Tarjetas', icon: 'grid_view' },
  { value: 'compact' as const, label: 'Compacto', icon: 'table_rows' },
]

/** Búsqueda de salas (/salas) y detalle de sala (/salas/:roomId). */
export default function SearchPage() {
  const { catalog, error } = useCatalog()

  if (error) {
    return (
      <EmptyState
        icon="cloud_off"
        title="No se pudieron cargar los datos"
        description="Revisa tu conexión y vuelve a intentarlo."
        action={<Button onClick={() => window.location.reload()}>Reintentar</Button>}
        className="flex-1"
      />
    )
  }
  if (!catalog) return <SearchSkeleton />
  return <SearchView catalog={catalog} />
}

interface SummariesState {
  key: string
  summaries: RoomSummary[]
  error: boolean
}

function SearchView({ catalog }: { catalog: Catalog }) {
  const { roomId } = useParams()
  const location = useLocation()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const { filters, now, isNow, hasExplicitFilters, update, resetToNow, clearFilters } =
    useSearchFilters(catalog)
  const { buildingCode, day, module, query, onlyFree, view } = filters
  const [result, setResult] = useState<SummariesState | null>(null)

  // Se cargan todas las salas del módulo; sector, búsqueda y "solo libres" se filtran localmente.
  const slotKey = `${day}-${module}`
  useEffect(() => {
    let cancelled = false
    getRoomSummaries({ day, module })
      .then((summaries) => {
        if (!cancelled) setResult({ key: `${day}-${module}`, summaries, error: false })
      })
      .catch(() => {
        if (!cancelled) setResult({ key: `${day}-${module}`, summaries: [], error: true })
      })
    return () => {
      cancelled = true
    }
  }, [day, module])

  // Registra la búsqueda en el historial cuando los filtros se mantienen 1,5 s.
  useEffect(() => {
    if (!hasExplicitFilters) return
    const timer = setTimeout(() => {
      addHistoryEntry({
        type: 'search',
        filters: { buildingCode, day, module, query: query.trim() || undefined, onlyFree: onlyFree || undefined },
      }).catch(() => undefined)
    }, 1500)
    return () => clearTimeout(timer)
  }, [hasExplicitFilters, buildingCode, day, module, query, onlyFree])

  const loading = result?.key !== slotKey
  const all = result?.summaries ?? []
  const normalizedQuery = query.trim().toLowerCase()
  const visible = all.filter(
    (s) =>
      (!buildingCode || s.room.buildingCode === buildingCode) &&
      (!onlyFree || s.status === 'free') &&
      (!normalizedQuery ||
        s.room.name.toLowerCase().includes(normalizedQuery) ||
        s.building.name.toLowerCase().includes(normalizedQuery)),
  )
  const freeCounts = { all: 0 } as Record<BuildingCode | 'all', number>
  for (const building of catalog.buildings) freeCounts[building.code] = 0
  for (const s of all) {
    if (s.status !== 'free') continue
    freeCounts.all += 1
    freeCounts[s.room.buildingCode] += 1
  }
  const visibleFree = visible.filter((s) => s.status === 'free').length

  const linkTo = (id: string): To => ({ pathname: `/salas/${encodeURIComponent(id)}`, search: location.search })
  const closeTo: To = { pathname: '/salas', search: location.search }

  // Móvil: el detalle se abre como página aparte.
  if (roomId && !isDesktop) {
    return (
      <div className="flex-1 bg-surface-container-lowest">
        <div className="sticky top-14 z-30 border-b border-outline-variant/30 bg-surface-container-lowest/90 px-2 backdrop-blur-md">
          <Link
            to={closeTo}
            className="inline-flex min-h-11 items-center gap-1 px-2 text-body-sm font-semibold text-secondary"
          >
            <Icon name="arrow_back" className="text-[18px]" />
            Volver a resultados
          </Link>
        </div>
        <RoomDetailPanel
          roomId={roomId}
          day={day}
          module={module}
          catalog={catalog}
          closeTo={closeTo}
          variant="page"
        />
      </div>
    )
  }

  const sectorText = catalog.buildings.map((b) => b.code).join(', ').replace(/, ([^,]*)$/, ' y $1')

  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <section className="min-w-0 flex-1 p-margin md:p-margin-tablet lg:p-margin-desktop">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-headline-lg text-primary">Disponibilidad de salas</h1>
            <p className="text-body-sm text-outline">
              Campus San Joaquín · Ingeniería, sectores {sectorText}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label-mono text-outline">Vista:</span>
            <SegmentedControl<ViewMode>
              label="Tipo de vista"
              options={VIEW_OPTIONS}
              value={view}
              onChange={(value) => update({ view: value })}
            />
          </div>
        </div>

        <RoomFilters
          catalog={catalog}
          buildingCode={buildingCode}
          day={day}
          module={module}
          query={query}
          onlyFree={onlyFree}
          now={now}
          isNow={isNow}
          freeCounts={freeCounts}
          onChange={update}
          onNow={resetToNow}
        />

        <p
          aria-live="polite"
          className="mt-5 mb-3 flex items-center gap-2 text-label-mono text-outline"
        >
          {result && (
            <>
              {visible.length} {visible.length === 1 ? 'sala' : 'salas'} · {visibleFree}{' '}
              {visibleFree === 1 ? 'libre' : 'libres'}
            </>
          )}
          {loading && <Spinner className="size-3 text-secondary" />}
        </p>

        {!result ? (
          <ResultsSkeleton />
        ) : result.error && !loading ? (
          <EmptyState
            icon="cloud_off"
            title="No se pudo cargar la disponibilidad"
            description="Revisa tu conexión y vuelve a intentarlo."
          />
        ) : visible.length === 0 ? (
          <EmptyState
            icon="search_off"
            title="No hay salas que coincidan"
            description="Prueba con otro sector, módulo o término de búsqueda."
            action={
              <Button variant="outline" onClick={clearFilters}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <div className={cn('transition-opacity', loading && 'opacity-50')}>
            {view === 'compact' ? (
              <RoomCompactList summaries={visible} linkTo={linkTo} selectedId={roomId} />
            ) : (
              <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-1 lg:gap-gutter-desktop xl:grid-cols-2 2xl:grid-cols-3">
                {visible.map((summary) => (
                  <RoomCard
                    key={summary.room.id}
                    summary={summary}
                    to={linkTo(summary.room.id)}
                    selected={summary.room.id === roomId}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {isDesktop && (
        <aside
          aria-label="Detalle de la sala"
          className="custom-scroll sticky top-14 h-[calc(100dvh-3.5rem)] w-[410px] shrink-0 overflow-y-auto border-l border-outline-variant/30 bg-surface-container-lowest shadow-lg xl:w-[450px]"
        >
          {roomId ? (
            <RoomDetailPanel
              roomId={roomId}
              day={day}
              module={module}
              catalog={catalog}
              closeTo={closeTo}
              variant="drawer"
            />
          ) : (
            <EmptyState
              icon="meeting_room"
              title="Selecciona una sala"
              description="Elige una sala de la lista para ver su estado, equipamiento y cronograma del día."
              className="h-full"
            />
          )}
        </aside>
      )}
    </div>
  )
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, i) => (
        <Skeleton key={i} className="h-52 rounded-lg" />
      ))}
    </div>
  )
}

function SearchSkeleton() {
  return (
    <div className="space-y-4 p-margin md:p-margin-tablet lg:p-margin-desktop" aria-busy="true">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-8 w-full" />
      <ResultsSkeleton />
    </div>
  )
}
