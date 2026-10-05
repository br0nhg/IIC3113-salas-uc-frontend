import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import GuestAccessButton from '../components/auth/GuestAccessButton'
import HeroIntro from '../components/auth/HeroIntro'
import HeroPillars from '../components/auth/HeroPillars'
import Logo from '../components/ui/Logo'
import { getBuildings, getModules } from '../services'
import type { Building, TimeModule } from '../types'

/** Layout de la vista pública: hero a la izquierda y formulario de acceso a la derecha. */
export default function AuthLayout() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [modules, setModules] = useState<TimeModule[]>([])

  useEffect(() => {
    Promise.all([getBuildings(), getModules()])
      .then(([buildingsData, modulesData]) => {
        setBuildings(buildingsData)
        setModules(modulesData)
      })
      // El resumen de sectores es secundario: si falla, simplemente no se muestra.
      .catch(() => undefined)
  }, [])

  return (
    <div className="flex min-h-dvh flex-col bg-surface-container-lowest">
      <header className="flex items-center justify-between gap-2 border-b border-outline-variant/30 px-margin py-2 md:px-margin-desktop md:py-3">
        <div className="flex items-center gap-2">
          <Logo />
          <span className="hidden rounded bg-surface-container px-2 py-0.5 text-label-mono font-bold text-secondary sm:inline">
            ACCESO COMUNIDAD UC
          </span>
        </div>
        <GuestAccessButton appearance="link" />
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        <section className="flex flex-col justify-center bg-surface-container-low/40 px-margin py-6 md:p-margin-tablet lg:flex-1 lg:p-margin-desktop">
          <div className="mx-auto w-full max-w-xl space-y-6">
            <HeroIntro />
            <HeroPillars buildings={buildings} modules={modules} className="hidden lg:block" />
          </div>
        </section>

        <section className="flex flex-col justify-center border-outline-variant/30 bg-surface-container-lowest px-margin py-8 md:p-margin-tablet lg:w-[480px] lg:border-l lg:p-margin-desktop">
          <div className="mx-auto w-full max-w-sm space-y-6">
            <Outlet />
          </div>
        </section>

        {/* En móvil los pilares van después del formulario para no retrasar el acceso. */}
        <section className="border-t border-outline-variant/30 bg-surface-container-low/40 px-margin py-6 md:px-margin-tablet lg:hidden">
          <HeroPillars buildings={buildings} modules={modules} className="mx-auto max-w-xl" />
        </section>
      </div>
    </div>
  )
}
