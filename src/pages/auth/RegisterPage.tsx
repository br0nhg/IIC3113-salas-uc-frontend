import AuthSwitchLink from '../../components/auth/AuthSwitchLink'
import GuestAccessButton from '../../components/auth/GuestAccessButton'
import RegisterForm from '../../components/auth/RegisterForm'
import Divider from '../../components/ui/Divider'

/** Registro de cuenta con correo institucional (ruta "/registro"). */
export default function RegisterPage() {
  return (
    <>
      <div>
        <h2 className="text-headline-lg text-primary">Crear cuenta</h2>
        <p className="mt-1 text-body-sm text-outline">
          Regístrate con tu correo institucional <strong>@uc.cl</strong> para guardar favoritos,
          revisar tu historial y reportar el estado de las salas.
        </p>
      </div>

      <RegisterForm />

      <Divider label="O" />

      <GuestAccessButton />

      <AuthSwitchLink question="¿Ya tienes cuenta?" linkText="Inicia sesión" to="/" />
    </>
  )
}
