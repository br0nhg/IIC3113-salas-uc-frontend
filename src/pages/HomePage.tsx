import { useEffect, useState } from 'react'
import BuildingCard from '../components/BuildingCard'
import { getAvailability, getBuildings, getDays, getModules, USE_MOCK } from '../services'
import type { Availability, Building, Day, DayCode, ModuleNumber, TimeModule } from '../types'

const DAY_CODES_BY_JS_DAY: (DayCode | null)[] = [null, 'L', 'M', 'W', 'J', 'V', 'S']

/** Día y módulo actuales, o el primer módulo del lunes si no hay clases ahora. */
function getCurrentSlot(modules: TimeModule[]): { day: DayCode; module: ModuleNumber } {
  const now = new Date()
  const day = DAY_CODES_BY_JS_DAY[now.getDay()] ?? 'L'
  const time = now.toTimeString().slice(0, 5)
  const current = modules.find((module) => time <= module.end)
  return { day, module: current?.number ?? 1 }
}

export default function HomePage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [days, setDays] = useState<Day[]>([])
  const [modules, setModules] = useState<TimeModule[]>([])
  const [day, setDay] = useState<DayCode>('L')
  const [module, setModule] = useState<ModuleNumber>(1)
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loadedSlot, setLoadedSlot] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getBuildings(), getDays(), getModules()])
      .then(([buildingsData, daysData, modulesData]) => {
        setBuildings(buildingsData)
        setDays(daysData)
        setModules(modulesData)
        const slot = getCurrentSlot(modulesData)
        setDay(slot.day)
        setModule(slot.module)
      })
      .catch(() => setError('No se pudieron cargar los datos.'))
  }, [])

  useEffect(() => {
    let cancelled = false
    getAvailability({ day, module })
      .then((data) => {
        if (cancelled) return
        setAvailability(data)
        setLoadedSlot(`${day}-${module}`)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar la disponibilidad.')
      })
    return () => {
      cancelled = true
    }
  }, [day, module])

  const loading = loadedSlot !== `${day}-${module}`

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Salas disponibles</h1>
        <p className="mt-1 text-sm text-slate-600">
          Consulta qué salas de Ingeniería están libres para estudiar o reunirte.
        </p>
        {USE_MOCK && (
          <p className="mt-2 inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
            Mostrando datos de prueba
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:max-w-md">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Día
          <select
            value={day}
            onChange={(event) => setDay(event.target.value as DayCode)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {days.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Módulo
          <select
            value={module}
            onChange={(event) => setModule(Number(event.target.value) as ModuleNumber)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {modules.map((m) => (
              <option key={m.number} value={m.number}>
                {m.number} ({m.start}–{m.end})
              </option>
            ))}
          </select>
        </label>
      </div>

      {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className={`grid gap-4 sm:grid-cols-2 ${loading ? 'opacity-50' : ''}`}>
        {buildings.map((building) => (
          <BuildingCard
            key={building.code}
            building={building}
            availability={availability.filter((item) => item.buildingCode === building.code)}
          />
        ))}
      </div>
    </section>
  )
}
