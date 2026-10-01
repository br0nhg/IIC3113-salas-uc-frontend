# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

SalasUC: app web de solo lectura (sin login, sin reservas) para que la comunidad de Ingeniería UC consulte qué salas de los edificios **A, B, BC y K** están libres por día y módulo horario. Una sala está libre si no tiene curso asignado en BuscaCursos UC; el scraping lo hace el backend (Node.js, otro equipo). Diseño **mobile first** (mayoría de usuarios en celular) y objetivo de carga/interacción < 3 s. Contexto completo en `../contexto/salasuc-contexto.md`. La UI y los textos están en español.

## Comandos

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # tsc -b (chequeo de tipos) + vite build
npm run lint     # oxlint (config en .oxlintrc.json)
npm run preview  # sirve el build de producción
```

No hay framework de tests configurado todavía. `npm run build` es la verificación de tipos.

## Arquitectura

- **Capa de servicios como único acceso a datos.** Páginas y componentes solo importan desde `src/services` (barrel en `services/index.ts`), nunca desde `services/mock` ni usan `fetch` directamente. Cada función de `salasService.ts` revisa `USE_MOCK` (de `services/config.ts`): si `VITE_API_URL` está vacía devuelve datos de `services/mock/data.ts` con latencia simulada; si no, llama a la API con `getJson` (`services/http.ts`). Así, pasar a la API real no requiere tocar componentes.
- **Endpoints tentativos.** `/buildings`, `/rooms`, `/days`, `/modules`, `/availability` (con query params `building`, `room`, `day`, `module`, `onlyFree`) aún no están acordados con el backend; si cambian, ajustar solo `salasService.ts` y, si hace falta, `src/types`.
- **Tipos del dominio** en `src/types/index.ts`. Los días usan los códigos de BuscaCursos (`L M W J V S`, con `W` = miércoles) y los módulos son la unión literal `1..9` con el horario UC. El filtrado de disponibilidad se modela con `AvailabilityFilters`.
- **Datos mock deterministas:** la ocupación se genera con un hash de `sala-día-módulo`, así que es estable entre recargas. Para agregar salas basta con editar `MOCK_ROOMS`.
- **Ruteo:** `routes/AppRouter.tsx` usa `createBrowserRouter`; todas las páginas cuelgan de `layouts/MainLayout.tsx` (header/footer + `<Outlet />`). `vercel.json` reescribe todas las rutas a `index.html` para que el ruteo del lado del cliente funcione en Vercel.
- **Tailwind v4** vía el plugin `@tailwindcss/vite`; no hay `tailwind.config` ni PostCSS, solo `@import 'tailwindcss'` en `src/index.css`. Escribir estilos mobile first (clases base para móvil, `sm:`/`md:` para pantallas mayores).

## Convenciones

- TypeScript estricto con `noUncheckedIndexedAccess`: los accesos por índice devuelven `T | undefined` y hay que manejarlos.
- `verbatimModuleSyntax` está activo: usar `import type` para importaciones de solo tipos.
- oxlint marca `react(set-state-in-effect)`: no llamar `setState` de forma síncrona dentro de `useEffect`; derivar el estado durante el render (ver cómo se calcula `loading` en `HomePage.tsx`).
- Flujo de trabajo: ramas + pull requests en GitHub; no trabajar directamente en `main`.
