import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { useToast } from '../../context/toast-context'
import { ApiError } from '../../services'
import { MIN_PASSWORD_LENGTH, validateEmail, validatePassword } from '../../utils/validation'
import Alert from '../ui/Alert'
import Button from '../ui/Button'
import TextField from '../ui/TextField'

interface RegisterErrors {
  name?: string
  email?: string
  password?: string
  confirm?: string
}

export default function RegisterForm() {
  const { register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: RegisterErrors = {
      name: name.trim() ? undefined : 'Ingresa tu nombre.',
      email: validateEmail(email),
      password: validatePassword(password),
      confirm: confirm === password ? undefined : 'Las contraseñas no coinciden.',
    }
    setErrors(nextErrors)
    setSubmitError(null)
    if (Object.values(nextErrors).some(Boolean)) return

    setLoading(true)
    try {
      const user = await register({ name, email, password })
      showToast(`Cuenta creada. ¡Bienvenido, ${user.name}!`)
      navigate('/salas', { replace: true })
    } catch (error) {
      setSubmitError(
        error instanceof ApiError && error.status === 409
          ? error.message
          : 'No se pudo crear la cuenta. Intenta nuevamente.',
      )
      setLoading(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      {submitError && <Alert variant="error">{submitError}</Alert>}
      <TextField
        label="Nombre"
        icon="person"
        autoComplete="name"
        placeholder="Nombre y apellido"
        value={name}
        onChange={(event) => setName(event.target.value)}
        error={errors.name}
      />
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
        autoComplete="new-password"
        placeholder="••••••••"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        error={errors.password}
        hint={`Mínimo ${MIN_PASSWORD_LENGTH} caracteres.`}
      />
      <TextField
        label="Confirmar contraseña"
        icon="lock"
        type="password"
        autoComplete="new-password"
        placeholder="••••••••"
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        error={errors.confirm}
      />
      <Button type="submit" icon="person_add" fullWidth loading={loading}>
        Crear cuenta
      </Button>
    </form>
  )
}
