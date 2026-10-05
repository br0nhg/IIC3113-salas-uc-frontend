import { Link } from 'react-router-dom'

interface AuthSwitchLinkProps {
  question: string
  linkText: string
  to: string
}

/** Enlace para alternar entre Iniciar sesión y Crear cuenta. */
export default function AuthSwitchLink({ question, linkText, to }: AuthSwitchLinkProps) {
  return (
    <p className="text-center text-body-sm text-outline">
      {question}{' '}
      <Link to={to} className="font-semibold text-secondary hover:underline">
        {linkText}
      </Link>
    </p>
  )
}
