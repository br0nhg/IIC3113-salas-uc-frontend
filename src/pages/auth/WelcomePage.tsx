import AuthSwitchLink from '../../components/auth/AuthSwitchLink'
import GuestAccessButton from '../../components/auth/GuestAccessButton'
import LoginForm from '../../components/auth/LoginForm'
import Button from '../../components/ui/Button'
import Divider from '../../components/ui/Divider'

/** Bienvenida con inicio de sesión (ruta "/"). */
export default function WelcomePage() {
  return (
    <>
      <div>
        <h2 className="text-headline-lg text-primary">Iniciar sesión UC</h2>
        <p className="mt-1 text-body-sm text-outline">
          Ingresa con tu correo institucional <strong>@uc.cl</strong> para guardar tus salas
          favoritas y enviar reportes.
        </p>
      </div>

      <LoginForm />

      <Divider label="O" />

      <div className="space-y-3">
        <Button variant="outline" icon="badge" fullWidth disabled title="Disponible próximamente">
          SSO UC (próximamente)
        </Button>
        <GuestAccessButton />
      </div>

      <AuthSwitchLink question="¿No tienes cuenta?" linkText="Crear cuenta" to="/registro" />

      <p className="text-center text-[11px] text-outline">
        Al acceder aceptas los términos de uso de espacios universitarios de la Pontificia
        Universidad Católica de Chile.
      </p>
    </>
  )
}
