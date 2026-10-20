import { Link } from 'react-router-dom'
import Icon from './Icon'

/** Marca "Salas UC" con ícono; enlaza al destino indicado. */
export default function Logo({ to = '/' }: { to?: string }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 items-center gap-2 rounded focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none"
    >
      <Icon name="apartment" className="text-2xl text-secondary" />
      <span className="text-headline-sm font-bold whitespace-nowrap text-primary">Salas UC</span>
    </Link>
  )
}
