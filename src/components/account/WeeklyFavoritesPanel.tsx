import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Catalog } from '../../hooks/useCatalog'
import type { useFavorites } from '../../hooks/useFavorites'
import { useWeeklySchedules } from '../../hooks/useWeeklySchedules'
import { summarizeSchedule } from '../../services'
import type { Day, DayCode, ModuleNumber, RoomStatus, TimeModule, WeeklySchedule } from '../../types'
import { cn } from '../../utils/cn'
import { formatModuleRange, getCurrentSlot } from '../../utils/schedule'
import { roomSlotUrl } from '../../utils/searchParams'
import { STATUS_STYLES } from '../rooms/roomPresentation'
import WeeklyScheduleGrid from '../rooms/WeeklyScheduleGrid'
import Chip from '../ui/Chip'
import ChipGroup from '../ui/ChipGroup'
import EmptyState from '../ui/EmptyState'
import Icon from '../ui/Icon'
import Panel from '../ui/Panel'
import Skeleton from '../ui/Skeleton'

interface WeeklyFavoritesPanelProps {
  catalog: Catalog
  favorites: ReturnType<typeof useFavorites>
}

const ALL = 'all'

interface Slot {
  day: DayCode
  module: ModuleNumber
}

/** Estado y curso de una sala en un día y módulo, con la misma lógica que la búsqueda. */
function slotInfo(schedule: WeeklySchedule, day: DayCode, module: ModuleNumber) {
  const slots = schedule.days.find((d) => d.day === day)?.schedule ?? []
  return summarizeSchedule(slots, module)
}

const STATUS_ICON: Record<RoomStatus, string> = {
  free: 'check',
  soon: 'alarm',
  busy: 'close',
  nodata: 'remove',
}

const cellBase = 'flex h-10 w-full items-center justify-center rounded border text-xs font-semibold'

/** Horario semanal (lunes a sábado, M1 a M9) de las salas favoritas. */
export default function WeeklyFavoritesPanel({ catalog, favorites }: WeeklyFavoritesPanelProps) {
  const roomIds = favorites.favorites.map((f) => f.roomId)
  const { schedules, loading, error } = useWeeklySchedules(roomIds)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const now = getCurrentSlot(catalog.modules)

  if (favorites.loading || roomIds.length === 0) return null

  // Por defecto: todas si hay más de una favorita; si la elegida ya no está, se vuelve al defecto.
  const fallback = roomIds.length > 1 ? ALL : (roomIds[0] ?? ALL)
  const view = selected && (selected === ALL || roomIds.includes(selected)) ? selected : fallback
  const ordered = roomIds
    .map((id) => schedules.find((s) => s.room.id === id))
    .filter((s): s is WeeklySchedule => s !== undefined)
  const single = view === ALL ? null : (ordered.find((s) => s.room.id === view) ?? null)

  return (
    <Panel
      id="horario"
      title="Horario semanal"
      icon="calendar_view_week"
      action={<span className="text-label-mono text-outline">Lun–Sáb · M1–M9</span>}
    >
      {roomIds.length > 1 && (
        <div className="mb-3">
          <ChipGroup label="Ver">
            <Chip active={view === ALL} onClick={() => setSelected(ALL)}>
              Todas
            </Chip>
            {roomIds.map((id) => (
              <Chip key={id} active={view === id} onClick={() => setSelected(id)}>
                {id}
              </Chip>
            ))}
          </ChipGroup>
        </div>
      )}

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : error ? (
        <EmptyState
          icon="cloud_off"
          title="No se pudo cargar el horario"
          description="Revisa tu conexión y vuelve a intentarlo."
          className="py-6"
        />
      ) : view === ALL ? (
        <CombinedView
          catalog={catalog}
          schedules={ordered}
          now={now}
          selectedSlot={selectedSlot ?? (now ? { day: now.day, module: now.module } : null)}
          onSelectSlot={setSelectedSlot}
        />
      ) : single ? (
        <SingleView catalog={catalog} schedule={single} now={now} />
      ) : (
        <EmptyState icon="search_off" title={`No encontramos la sala ${view}`} className="py-6" />
      )}
    </Panel>
  )
}

/* ---------- Una sala ---------- */

function SingleView({
  catalog,
  schedule,
  now,
}: {
  catalog: Catalog
  schedule: WeeklySchedule
  now: ReturnType<typeof getCurrentSlot>
}) {
  const roomId = schedule.room.id
  return (
    <>
      <WeeklyScheduleGrid
        days={catalog.days}
        modules={catalog.modules}
        now={now}
        caption={`Horario semanal de la sala ${roomId}`}
        renderCell={(day, module) => {
          const { status, course } = slotInfo(schedule, day.code, module.number)
          const style = STATUS_STYLES[status]
          const label = `${day.name} M${module.number} (${formatModuleRange(module)}): ${style.label}${
            course ? `, ${course.code} ${course.name}` : ''
          }`
          const content = <Icon name={STATUS_ICON[status]} className="text-[16px]" />
          // Solo los módulos libres llevan a la consulta de ese día y módulo.
          return status === 'free' ? (
            <Link
              to={roomSlotUrl(roomId, day.code, module.number)}
              aria-label={`${label}. Abrir consulta`}
              title={label}
              className={cn(cellBase, style.badge, 'transition-transform hover:brightness-95 active:scale-95')}
            >
              {content}
            </Link>
          ) : (
            <span role="img" aria-label={label} title={label} className={cn(cellBase, style.badge)}>
              {content}
            </span>
          )
        }}
      />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-outline">
        {(Object.keys(STATUS_STYLES) as RoomStatus[]).map((status) => (
          <li key={status} className="flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full', STATUS_STYLES[status].dot)} />
            {STATUS_STYLES[status].label}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] text-outline">Toca un módulo libre para abrir la consulta de ese día y módulo.</p>
    </>
  )
}

/* ---------- Todas las favoritas ---------- */

function CombinedView({
  catalog,
  schedules,
  now,
  selectedSlot,
  onSelectSlot,
}: {
  catalog: Catalog
  schedules: WeeklySchedule[]
  now: ReturnType<typeof getCurrentSlot>
  selectedSlot: Slot | null
  onSelectSlot: (slot: Slot) => void
}) {
  const total = schedules.length
  const freeIn = (day: DayCode, module: ModuleNumber) =>
    schedules.filter((s) => slotInfo(s, day, module).status === 'free')

  const selectedDay = catalog.days.find((d) => d.code === selectedSlot?.day)
  const selectedModule = catalog.modules.find((m) => m.number === selectedSlot?.module)

  return (
    <>
      <WeeklyScheduleGrid
        days={catalog.days}
        modules={catalog.modules}
        now={now}
        caption="Cantidad de salas favoritas libres por día y módulo"
        renderCell={(day, module) => {
          const free = freeIn(day.code, module.number).length
          const isSelected = selectedSlot?.day === day.code && selectedSlot.module === module.number
          return (
            <button
              type="button"
              aria-pressed={isSelected}
              aria-label={`${day.name} M${module.number} (${formatModuleRange(module)}): ${free} de ${total} libres`}
              title={`${free} de ${total} libres`}
              onClick={() => onSelectSlot({ day: day.code, module: module.number })}
              className={cn(
                cellBase,
                'transition-transform active:scale-95',
                free === 0
                  ? 'border-outline-variant/40 bg-surface-container text-outline'
                  : free === total
                    ? 'border-status-free-dot bg-status-free-dot text-white'
                    : 'border-status-free-border bg-status-free-container text-status-free',
                isSelected && 'ring-2 ring-primary',
              )}
            >
              {free}
            </button>
          )
        }}
      />
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-outline">
        <LegendSwatch className="border-outline-variant/40 bg-surface-container">Ninguna libre</LegendSwatch>
        <LegendSwatch className="border-status-free-border bg-status-free-container">Algunas libres</LegendSwatch>
        <LegendSwatch className="border-status-free-dot bg-status-free-dot">Todas libres</LegendSwatch>
      </ul>

      {selectedDay && selectedModule && (
        <SlotDetail
          day={selectedDay}
          module={selectedModule}
          schedules={schedules}
        />
      )}
    </>
  )
}

function LegendSwatch({ className, children }: { className: string; children: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className={cn('size-3 rounded-sm border', className)} />
      {children}
    </li>
  )
}

/** Salas favoritas libres y ocupadas en el módulo elegido de la grilla combinada. */
function SlotDetail({ day, module, schedules }: { day: Day; module: TimeModule; schedules: WeeklySchedule[] }) {
  const rows = schedules.map((s) => ({ schedule: s, ...slotInfo(s, day.code, module.number) }))
  const free = rows.filter((r) => r.status === 'free')
  const others = rows.filter((r) => r.status !== 'free')

  return (
    <div aria-live="polite" className="mt-4 rounded-lg border border-outline-variant/40 bg-surface-container-low/40 p-3">
      <p className="text-label-mono text-outline uppercase">
        {day.name} · M{module.number} ({formatModuleRange(module)})
      </p>
      {free.length === 0 ? (
        <p className="mt-2 text-body-sm text-on-surface-variant">Ninguna de tus favoritas está libre en este módulo.</p>
      ) : (
        <div className="mt-2 flex flex-wrap gap-2">
          {free.map(({ schedule }) => (
            <Link
              key={schedule.room.id}
              to={roomSlotUrl(schedule.room.id, day.code, module.number)}
              className={cn(
                'flex min-h-11 items-center gap-1.5 rounded border px-3 text-body-sm font-semibold sm:min-h-8',
                STATUS_STYLES.free.badge,
              )}
            >
              <span className={cn('size-2 rounded-full', STATUS_STYLES.free.dot)} />
              {schedule.room.name}
              <Icon name="arrow_forward" className="text-[16px]" />
            </Link>
          ))}
        </div>
      )}
      {others.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-xs text-outline">
          {others.map(({ schedule, status, course }) => (
            <li key={schedule.room.id} className="truncate">
              <span className={cn('font-semibold', STATUS_STYLES[status].text)}>{schedule.room.name}</span>{' '}
              {STATUS_STYLES[status].label.toLowerCase()}
              {course ? ` · ${course.code} ${course.name}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
