const TIME = new Intl.DateTimeFormat('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false })
const SHORT_DATE = new Intl.DateTimeFormat('es-CL', { day: 'numeric', month: 'short' })

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

/** "Hoy, 11:24", "Ayer, 16:10" o "3 oct, 14:20". */
export function formatDayTime(iso: string, now = new Date()): string {
  const date = new Date(iso)
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)
  const time = TIME.format(date)
  if (days === 0) return `Hoy, ${time}`
  if (days === 1) return `Ayer, ${time}`
  return `${SHORT_DATE.format(date)}, ${time}`
}
