import type { Catalog } from '../../hooks/useCatalog'
import type { FiltersPatch } from '../../hooks/useSearchFilters'
import type { BuildingCode, DayCode, ModuleNumber } from '../../types'
import type { CurrentSlot } from '../../utils/schedule'
import { getTodayCode } from '../../utils/schedule'
import Checkbox from '../ui/Checkbox'
import Chip from '../ui/Chip'
import ChipGroup from '../ui/ChipGroup'
import SearchField from '../ui/SearchField'
import Select from '../ui/Select'

interface RoomFiltersProps {
  catalog: Catalog
  buildingCode?: BuildingCode
  day: DayCode
  module: ModuleNumber
  query: string
  onlyFree: boolean
  now: CurrentSlot | null
  isNow: boolean
  /** Salas libres por sector ('all' = todos) en el día y módulo consultados. */
  freeCounts: Record<BuildingCode | 'all', number>
  onChange: (patch: FiltersPatch) => void
  onNow: () => void
}

/** Búsqueda, día, solo libres, selector de sector y selector de módulo. */
export default function RoomFilters({
  catalog,
  buildingCode,
  day,
  module,
  query,
  onlyFree,
  now,
  isNow,
  freeCounts,
  onChange,
  onNow,
}: RoomFiltersProps) {
  const today = getTodayCode()

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField
          label="Buscar sala"
          placeholder="Buscar sala (ej. K200, B12, BC)…"
          value={query}
          onChange={(value) => onChange({ query: value })}
          enableShortcut
          className="sm:flex-1"
        />
        <div className="flex items-center gap-3">
          <Select
            label="Día"
            hideLabel
            value={day}
            onChange={(event) => onChange({ day: event.target.value as DayCode })}
            className="flex-1 sm:w-40 sm:flex-none"
          >
            {catalog.days.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
                {d.code === today ? ' (hoy)' : ''}
              </option>
            ))}
          </Select>
          <Checkbox
            label="Solo libres"
            checked={onlyFree}
            onChange={(event) => onChange({ onlyFree: event.target.checked })}
          />
        </div>
      </div>

      <ChipGroup label="Sector">
        <Chip active={!buildingCode} count={freeCounts.all} onClick={() => onChange({ buildingCode: null })}>
          Todos
        </Chip>
        {catalog.buildings.map((building) => (
          <Chip
            key={building.code}
            active={buildingCode === building.code}
            count={freeCounts[building.code]}
            onClick={() => onChange({ buildingCode: building.code })}
            aria-label={`Sector ${building.code}, ${freeCounts[building.code]} salas libres`}
          >
            Sector {building.code}
          </Chip>
        ))}
      </ChipGroup>

      <ChipGroup label="Módulo">
        {now && (
          <Chip tone="accent" active={isNow} onClick={onNow}>
            <span className="size-1.5 rounded-full bg-secondary" />
            {now.inProgress ? 'Ahora' : 'Próximo'} (M{now.module})
          </Chip>
        )}
        {catalog.modules.map((m) => (
          <Chip
            key={m.number}
            tone="accent"
            active={!isNow && module === m.number}
            onClick={() => onChange({ module: m.number })}
            title={`${m.start} – ${m.end}`}
          >
            M{m.number} <span className="text-outline">{m.start}</span>
          </Chip>
        ))}
      </ChipGroup>
    </div>
  )
}
