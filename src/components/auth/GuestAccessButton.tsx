import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import Button from '../ui/Button'
import Icon from '../ui/Icon'

interface GuestAccessButtonProps {
  /** "link" para la cabecera, "button" para el panel del formulario. */
  appearance?: 'link' | 'button'
}

/** Inicia una sesión de invitado y lleva a la búsqueda de salas. */
export default function GuestAccessButton({ appearance = 'button' }: GuestAccessButtonProps) {
  const { loginAsGuest } = useAuth()
  const navigate = useNavigate()

  function handleClick() {
    loginAsGuest()
    navigate('/salas')
  }

  if (appearance === 'link') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="flex min-h-11 shrink-0 items-center gap-1 rounded px-1 text-label-mono whitespace-nowrap text-secondary hover:underline focus-visible:ring-2 focus-visible:ring-secondary focus-visible:outline-none sm:min-h-0"
      >
        Acceder como invitado
        <Icon name="arrow_forward" className="text-[16px]" />
      </button>
    )
  }

  return (
    <Button variant="outline" icon="person_outline" fullWidth onClick={handleClick}>
      Acceder como invitado
    </Button>
  )
}
