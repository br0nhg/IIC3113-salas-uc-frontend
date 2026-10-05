# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Proyecto

SalasUC: app web para que la comunidad de Ingeniería UC consulte qué salas de los edificios **A, B, BC y K** están libres por día y módulo horario (sin reservas). Una sala está libre si no tiene curso asignado en BuscaCursos UC; el scraping lo hace el backend (Node.js, otro equipo). Diseño **mobile first** (mayoría de usuarios en celular) y objetivo de carga/interacción < 3 s. Contexto completo en `../Contexto/salasuc-contexto.md`. La UI y los textos están en español.

Las vistas vienen del prototipo de Stitch (`../disenos-stitch/`): acceso (login, registro, invitado), búsqueda de salas con detalle, favoritos/historial/reportes y consola de administración. Login, cuentas, favoritos, reportes y admin **amplían el alcance original del MVP** (que era solo lectura y sin login); por ahora funcionan solo con datos mock y está pendiente acordarlos con el equipo.

## Comandos

```bash
npm run dev      # servidor de desarrollo Vite
npm run build    # tsc -b (chequeo de tipos) + vite build
npm run lint     # oxlint (config en .oxlintrc.json)
npm run preview  # sirve el build de producción
```

No hay framework de tests configurado todavía. `npm run build` es la verificación de tipos.

## Arquitectura

- **Capa de servicios como único acceso a datos.** Páginas y componentes solo importan desde `src/services` (barrel en `services/index.ts`), nunca desde `services/mock` ni usan `fetch` directamente. Cada función de servicio revisa `USE_MOCK` (de `services/config.ts`): si `VITE_API_URL` está vacía devuelve datos de `services/mock/*` con latencia simulada (`mockResponse` / `mockError` en `services/mock/utils.ts`); si no, llama a la API con `getJson` / `postJson` (`services/http.ts`). Así, pasar a la API real no requiere tocar componentes.
- **Servicios por dominio:** `salasService.ts` (edificios, salas, días, módulos, disponibilidad) y `authService.ts` (reexportado como `authService`: `login`, `register`, `loginAsGuest`, `logout`, `getStoredSession`). Los errores de la API (reales o mock) son `ApiError` con `status`.
- **Endpoints tentativos.** `/buildings`, `/rooms`, `/days`, `/modules`, `/availability` (query params `building`, `room`, `day`, `module`, `onlyFree`) y `POST /auth/login|register|logout` aún no están acordados con el backend; si cambian, ajustar solo el servicio y, si hace falta, `src/types`.
- **Sesión:** `context/AuthProvider.tsx` + `useAuth()` (`context/auth-context.ts`). Roles `guest | student | admin`. La sesión se guarda en localStorage ("recordar") o sessionStorage vía `services/storage.ts` (tolerante a almacenamiento bloqueado), y `http.ts` agrega el token como `Authorization: Bearer`. Cuentas mock en `services/mock/auth.ts` (ver README).
- **Notificaciones:** `context/ToastProvider.tsx` + `useToast().showToast(mensaje, variante)`.
- **Tipos del dominio** en `src/types/index.ts`. Los días usan los códigos de BuscaCursos (`L M W J V S`, con `W` = miércoles) y los módulos son la unión literal `1..9` con el horario oficial UC (`MOCK_MODULES`, M1 08:20–09:30 … M9 20:10–21:20). Cualquier texto con horas o números de módulo se calcula desde esos datos, nunca escrito a mano.
- **Datos mock deterministas:** la ocupación se genera con un hash de `sala-día-módulo`, así que es estable entre recargas. Para agregar salas basta con editar `MOCK_ROOMS`.
- **Ruteo:** `routes/AppRouter.tsx` usa `createBrowserRouter`. `/` (bienvenida + login) y `/registro` cuelgan de `layouts/AuthLayout.tsx`; `/salas` usa por ahora `MainLayout` + `HomePage` (provisorio). `vercel.json` reescribe todas las rutas a `index.html`.
- **Tailwind v4** vía `@tailwindcss/vite`; no hay `tailwind.config`. El tema de `docs/DESIGN.md` está en el bloque `@theme` de `src/index.css`: colores (`bg-primary`, `text-on-surface-variant`, `bg-status-free-container`…), tipografía (`text-headline-lg`, `text-label-mono`, `text-badge-status`…, fuente Geist), espaciados (`p-margin`, `md:p-margin-tablet`, `gap-gutter`, `p-space-lg`…), `shadow-card` y `animate-pulse-dot`. Estilos mobile first (base = móvil; `sm:`/`md:`/`lg:` para pantallas mayores); objetivos táctiles de 44 px en móvil.
- **Componentes base** en `components/ui/` (`Button`, `ButtonLink`, `TextField`, `Checkbox`, `Alert`, `Divider`, `Icon`, `Logo`, `Spinner`, `Toast`). Reutilizarlos antes de crear estilos nuevos; las clases compartidas viven en `buttonStyles.ts` y `fieldStyles.ts`.
- **Íconos:** Material Symbols vía Google Fonts, siempre con `<Icon name="..." />` (clase propia `.ms-icon`; no usar `.material-symbols-outlined`, cuya hoja no está en una capa y pisa los tamaños `text-*`).

## Convenciones

- TypeScript estricto con `noUncheckedIndexedAccess`: los accesos por índice devuelven `T | undefined` y hay que manejarlos.
- `verbatimModuleSyntax` está activo: usar `import type` para importaciones de solo tipos.
- oxlint marca `react(set-state-in-effect)`: no llamar `setState` de forma síncrona dentro de `useEffect`; derivar el estado durante el render (ver cómo se calcula `loading` en `HomePage.tsx`).
- `react/only-export-components`: los contextos y hooks van en archivos `.ts` separados del componente proveedor (ej. `auth-context.ts` / `AuthProvider.tsx`).
- Flujo de trabajo: ramas + pull requests en GitHub; no trabajar directamente en `main`.
