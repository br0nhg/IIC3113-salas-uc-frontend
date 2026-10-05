import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useToast } from '../../context/toast-context'
import { ApiError } from '../../services'
import { validateEmail } from '../../utils/validation'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import TextField from '../ui/TextField'

interface LoginErrors {
  email?: string
  password?: string
}

export default function LoginForm() {
  const { login } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/salas'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: LoginErrors = {
      email: validateEmail(email),
      password: password ? undefined : 'Ingresa tu contraseña.',
    }
    setErrors(nextErrors)
    setSubmitError(null)
    if (nextErrors.email || nextErrors.password) return

    setLoading(true)
    try {
      const user = await login({ email, password, remember })
      showToast(`Sesión iniciada. ¡Hola, ${user.name}!`)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 401
          ? error.message
          : 'No se pudo iniciar sesión. Intenta nuevamente.',
      )
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert variant="error">{submitError}</Alert>}
      <TextField
        label="Correo institucional UC"
        icon="mail"
        type="email"
        autoComplete="email"
        inputMode="email"
        placeholder="usuario@uc.cl"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        error={errors.email}
      />
      <TextField
        label="Contraseña"
        icon="lock"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        labelAction={
          <button
            type="button"
            className="text-body-sm text-secondary hover:underline"
            onClick={() => showToast('La recuperación de contraseña estará disponible pronto.', 'info')}
          >
            ¿Olvidaste tu clave?
          </button>
        }
      />
      <Checkbox
        label="Recordar en este navegador"
        checked={remember}
        onChange={(event) => setRemember(event.target.checked)}
      />
      <Button type="submit" icon="login" fullWidth loading={loading}>
        Acceder con cuenta UC
      </Button>
    </form>
  )
}
