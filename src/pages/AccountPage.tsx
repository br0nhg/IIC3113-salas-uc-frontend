import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import ButtonLink from '../components/ui/ButtonLink'
import EmptyState from '../components/ui/EmptyState'
import Icon from '../components/ui/Icon'
import Modal from '../components/ui/Modal'
import Panel from '../components/ui/Panel'
import TextField from '../components/ui/TextField'
import { hasAccount, useAuth } from '../context/auth-context'
import { useToast } from '../context/toast-context'
import { useLogout } from '../hooks/useLogout'
import { ApiError } from '../services'

const MAX_NAME_LENGTH = 80

/** Datos de la cuenta: editar nombre, cerrar sesión y eliminar la cuenta (/cuenta). */
export default function AccountPage() {
  const { user } = useAuth()
  const logout = useLogout()
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex-1">
      <header className="flex items-center gap-2 border-b border-outline-variant/30 bg-surface-container-lowest px-margin py-3 md:px-margin-tablet md:py-4 lg:px-margin-desktop">
        <Link
          to="/salas"
          aria-label="Volver a la búsqueda"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container sm:size-9"
        >
          <Icon name="arrow_back" />
        </Link>
        <h1 className="text-headline-sm text-primary md:text-headline-md">Mi cuenta</h1>
      </header>

      {!user || !hasAccount(user) ? (
        <EmptyState
          icon="lock"
          title="Inicia sesión para ver tu cuenta"
          description="Con tu cuenta UC puedes editar tus datos, guardar favoritos y enviar reportes."
          action={
            <ButtonLink to="/" state={{ from: '/cuenta' }} icon="login">
              Iniciar sesión
            </ButtonLink>
          }
          className="py-16"
        />
      ) : (
        <div className="mx-auto w-full max-w-2xl space-y-6 p-margin md:p-margin-tablet lg:p-margin-desktop">
          <Panel title="Datos personales" icon="person">
            {/* key: el formulario parte con el nombre guardado tras cada cambio. */}
            <ProfileForm key={user.name} name={user.name} email={user.email ?? ''} />
          </Panel>

          <Panel title="Sesión" icon="logout">
            <p className="mb-4 text-body-sm text-on-surface-variant">
              Al cerrar sesión puedes seguir consultando salas como invitado.
            </p>
            <Button variant="outline" icon="logout" onClick={() => void logout()}>
              Cerrar sesión
            </Button>
          </Panel>

          <Panel title="Eliminar cuenta" icon="delete_forever" iconClassName="text-error">
            <p className="mb-4 text-body-sm text-on-surface-variant">
              Se borran tu cuenta y tus salas favoritas. Esta acción no se puede deshacer.
            </p>
            <Button variant="danger" icon="delete" onClick={() => setDeleteOpen(true)}>
              Eliminar mi cuenta
            </Button>
          </Panel>
        </div>
      )}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar cuenta"
        icon="warning"
        iconClassName="text-error"
      >
        <DeleteAccountForm onCancel={() => setDeleteOpen(false)} />
      </Modal>
    </div>
  )
}

function ProfileForm({ name: savedName, email }: { name: string; email: string }) {
  const { updateName } = useAuth()
  const { showToast } = useToast()
  const [name, setName] = useState(savedName)
  const [error, setError] = useState<string | undefined>()
  const [saving, setSaving] = useState(false)

  const trimmed = name.trim()
  const unchanged = trimmed === savedName

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmed) {
      setError('Ingresa tu nombre.')
      return
    }
    setSaving(true)
    setError(undefined)
    try {
      await updateName(trimmed)
      showToast('Nombre actualizado')
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar el nombre.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <TextField
        label="Nombre"
        icon="badge"
        value={name}
        maxLength={MAX_NAME_LENGTH}
        autoComplete="name"
        error={error}
        onChange={(event) => {
          setName(event.target.value)
          setError(undefined)
        }}
      />
      <TextField label="Correo UC" icon="mail" value={email} readOnly hint="El correo no se puede cambiar." />
      <div className="flex justify-end">
        <Button type="submit" icon="save" loading={saving} disabled={unchanged}>
          Guardar cambios
        </Button>
      </div>
    </form>
  )
}

function DeleteAccountForm({ onCancel }: { onCancel: () => void }) {
  const { deleteAccount } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!password) {
      setError('Ingresa tu contraseña para confirmar.')
      return
    }
    setDeleting(true)
    setError(null)
    try {
      await deleteAccount(password)
      showToast('Tu cuenta fue eliminada', 'info')
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo eliminar la cuenta.')
      setDeleting(false)
    }
  }

  return (
    <form className="space-y-4 p-5" onSubmit={handleSubmit} noValidate>
      {error && <Alert variant="error">{error}</Alert>}
      <p className="text-body-sm text-on-surface-variant">
        Se borrarán tu cuenta y tus favoritos. Ingresa tu contraseña para confirmar.
      </p>
      <TextField
        label="Contraseña"
        icon="lock"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" icon="delete_forever" loading={deleting}>
          Eliminar definitivamente
        </Button>
      </div>
    </form>
  )
}
