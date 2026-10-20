import ButtonLink from '../components/ui/ButtonLink'
import EmptyState from '../components/ui/EmptyState'

export default function NotFoundPage() {
  return (
    <EmptyState
      icon="explore_off"
      title="Página no encontrada"
      description="La dirección que buscas no existe o fue movida."
      action={
        <ButtonLink to="/salas" icon="search">
          Ir a buscar salas
        </ButtonLink>
      }
      className="flex-1 py-16"
    />
  )
}
