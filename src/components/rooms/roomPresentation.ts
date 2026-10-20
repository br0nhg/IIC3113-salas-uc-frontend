import type { RoomFeature, RoomStatus, StatusTransition } from '../../types'

/** Etiquetas y clases de cada estado (tokens status-* de DESIGN.md). */
export const STATUS_STYLES: Record<
  RoomStatus,
  { label: string; badge: string; dot: string; text: string; panel: string; pulse: boolean }
> = {
  free: {
    label: 'Disponible',
    badge: 'border-status-free-border bg-status-free-container text-status-free',
    dot: 'bg-status-free-dot',
    text: 'text-status-free',
    panel: 'border-status-free-border bg-status-free-container/60',
    pulse: true,
  },
  soon: {
    label: 'Libre pronto',
    badge: 'border-status-soon-border bg-status-soon-container text-status-soon',
    dot: 'bg-status-soon-dot',
    text: 'text-status-soon',
    panel: 'border-status-soon-border bg-status-soon-container/60',
    pulse: true,
  },
  busy: {
    label: 'Ocupada',
    badge: 'border-status-busy-border bg-status-busy-container text-status-busy',
    dot: 'bg-status-busy-dot',
    text: 'text-status-busy',
    panel: 'border-status-busy-border bg-status-busy-container/60',
    pulse: false,
  },
  nodata: {
    label: 'Sin datos',
    badge: 'border-status-nodata-border bg-status-nodata-container text-status-nodata',
    dot: 'bg-status-nodata-dot',
    text: 'text-status-nodata',
    panel: 'border-status-nodata-border bg-status-nodata-container',
    pulse: false,
  },
}

export const FEATURE_INFO: Record<RoomFeature, { icon: string; label: string }> = {
  projector: { icon: 'videocam', label: 'Proyector' },
  'air-conditioning': { icon: 'ac_unit', label: 'Climatizada' },
  'power-outlets': { icon: 'power', label: 'Enchufes' },
  whiteboard: { icon: 'draw', label: 'Pizarra' },
  wifi: { icon: 'wifi', label: 'Wi‑Fi UC' },
}

/** Texto corto del próximo cambio de estado ("Libre hasta las 14:50 (M5)"). */
/** Capacidad de la sala; la ingresa el administrador. */
export function formatCapacity(
  capacity: number | null,
  unit = 'personas',
  emptyText = 'Sin información',
): string {
  return capacity === null ? emptyText : `${capacity} ${unit}`
}

/** Piso de la sala; lo ingresa el administrador. */
export function formatFloor(floor: number | null): string {
  return floor === null ? 'Piso sin información' : `Piso ${floor}`
}

export function transitionText(status: RoomStatus, transition: StatusTransition | null): string {
  if (status === 'nodata') return 'Sin información de BuscaCursos'
  if (!transition) return status === 'free' ? 'Libre el resto del día' : 'Ocupada el resto del día'
  const at = `${transition.module.start} (M${transition.module.number})`
  return transition.kind === 'busy-from' ? `Libre hasta las ${at}` : `Libre desde las ${at}`
}

/** Ícono que acompaña al texto de transición. */
export function transitionIcon(status: RoomStatus): string {
  if (status === 'free') return 'schedule'
  if (status === 'nodata') return 'help_outline'
  return status === 'soon' ? 'alarm' : 'timer'
}
