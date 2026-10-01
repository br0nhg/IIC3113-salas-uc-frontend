import type { Availability, Building } from '../types'

interface BuildingCardProps {
  building: Building
  availability: Availability[]
}

export default function BuildingCard({ building, availability }: BuildingCardProps) {
  const freeRooms = availability.filter((item) => item.isFree)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold">{building.name}</h2>
        <span className="text-sm text-slate-500">
          {freeRooms.length}/{availability.length} libres
        </span>
      </header>

      <ul className="flex flex-wrap gap-2">
        {availability.map((item) => (
          <li
            key={item.roomId}
            title={item.course ? `${item.course.code} - ${item.course.name}` : 'Libre'}
            className={`rounded-md px-2.5 py-1 text-sm font-medium ${
              item.isFree ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400 line-through'
            }`}
          >
            {item.roomId}
          </li>
        ))}
      </ul>
    </article>
  )
}
