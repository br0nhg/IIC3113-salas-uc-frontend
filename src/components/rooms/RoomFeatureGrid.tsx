import type { Room } from '../../types'
import Icon from '../ui/Icon'
import { FEATURE_INFO } from './roomPresentation'

/** Capacidad y equipamiento de la sala en una grilla de dos columnas. */
export default function RoomFeatureGrid({ room }: { room: Room }) {
  const items = [
    { icon: 'groups', label: 'Capacidad', value: `${room.capacity} personas` },
    ...room.features.map((feature) => ({
      icon: FEATURE_INFO[feature].icon,
      label: 'Equipamiento',
      value: FEATURE_INFO[feature].label,
    })),
  ]

  return (
    <section>
      <h3 className="mb-2 text-label-mono text-outline uppercase">Equipamiento e infraestructura</h3>
      <ul className="grid grid-cols-2 gap-2 text-body-sm">
        {items.map((item) => (
          <li
            key={item.value}
            className="flex items-center gap-2 rounded border border-outline-variant/30 bg-surface-container-low p-2.5"
          >
            <Icon name={item.icon} className="text-[18px] text-secondary" />
            <div className="min-w-0">
              <div className="text-[11px] text-outline">{item.label}</div>
              <div className="truncate font-medium text-on-surface">{item.value}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
