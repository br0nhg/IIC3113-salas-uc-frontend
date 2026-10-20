/** Titular y bajada de la página de bienvenida. */
export default function HeroIntro() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-label-mono text-on-primary">
        <span className="size-1.5 rounded-full bg-status-free-dot" />
        Ingeniería UC · Campus San Joaquín
      </span>
      <h1 className="text-display-hero-mobile text-primary md:text-display-hero">
        Consulta la disponibilidad de salas en segundos.
      </h1>
      <p className="text-body-base text-outline md:text-body-lg">
        Para estudiantes, profesores y ayudantes de Ingeniería. Encuentra salas libres para
        estudiar, hacer clases o reunirte en grupo sin recorrer pasillos.
      </p>
    </div>
  )
}
