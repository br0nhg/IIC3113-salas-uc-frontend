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
- **Servicios por dominio:** `salasService.ts` (edificios, días y módulos memorizados con `cached`; salas, disponibilidad, `getRoomSummaries`, `getRoomDetail`, `getSyncStatus`), `authService.ts` (reexportado como `authService`), `favoritosService.ts`, `historialService.ts` y `reportesService.ts`. Los errores de la API (reales o mock) son `ApiError` con `status`.
- **Estado de sala** (`services/roomStatus.ts`, lógica pura sobre la disponibilidad del día, igual para mock y API): `free`, `soon` (ocupada ahora y libre en el módulo siguiente), `busy`, `nodata` (sin registro). `RoomSummary.transition` indica el próximo cambio de estado del día.
- **Datos por usuario en mock** (`services/mock/userStore.ts`): favoritos, historial y reportes se guardan en localStorage con el id del usuario de la sesión; `estudiante@uc.cl` parte con datos de demostración (`services/mock/userSeed.ts`). Los invitados no pueden guardar nada (los servicios responden 401 o no hacen nada); en la UI se usa `hasAccount(user)`. En componentes, cargar estos datos con `useAccountData(servicio)` (y `useFavorites()` para favoritos).
- **Endpoints tentativos.** `/buildings`, `/rooms`, `/rooms/:id`, `/days`, `/modules`, `/availability` (query params `building`, `room`, `day`, `module`, `onlyFree`), `/sync/status`, `POST /auth/login|register|logout`, `/me/favorites`, `/me/history`, `/me/reports` y `POST /reports` aún no están acordados con el backend; si cambian, ajustar solo el servicio y, si hace falta, `src/types`.
- **Sesión:** `context/AuthProvider.tsx` + `useAuth()` (`context/auth-context.ts`). Roles `guest | student | admin`. La sesión se guarda en localStorage ("recordar") o sessionStorage vía `services/storage.ts` (tolerante a almacenamiento bloqueado), y `http.ts` agrega el token como `Authorization: Bearer`. Cuentas mock en `services/mock/auth.ts` (ver README).
- **Notificaciones:** `context/ToastProvider.tsx` + `useToast().showToast(mensaje, variante)`.
- **Tipos del dominio** en `src/types/index.ts`. Los días usan los códigos de BuscaCursos (`L M W J V S`, con `W` = miércoles) y los módulos son la unión literal `1..9` con el horario oficial UC (`MOCK_MODULES`, M1 08:20–09:30 … M9 20:10–21:20). Cualquier texto con horas o números de módulo se calcula desde esos datos, nunca escrito a mano.
- **Datos mock deterministas:** la ocupación se genera con un hash de `sala-día-módulo`, así que es estable entre recargas. Para agregar salas basta con editar `MOCK_ROOMS`.
- **Ruteo:** `routes/AppRouter.tsx` usa `createBrowserRouter`. `/` (bienvenida + login) y `/registro` cuelgan de `layouts/AuthLayout.tsx`; `/salas` y `/salas/:roomId` (`pages/SearchPage.tsx`) cuelgan de `layouts/AppLayout.tsx` (TopNav, aviso de no reserva, BottomNav en móvil). El detalle de sala es un panel lateral en ≥ lg (`useMediaQuery(DESKTOP_QUERY)`) y una página aparte en móvil. `/favoritos` (`pages/FavoritesReportsPage.tsx`) reúne favoritos, historial (`#historial`) y reportes (`#reportes`); a invitados les pide iniciar sesión. `vercel.json` reescribe todas las rutas a `index.html`.
- **Filtros en la URL** (`utils/searchParams.ts`, `hooks/useSearchFilters.ts`): `sector`, `dia`, `modulo`, `q`, `libres=1`, `vista=compacto`. Sin `dia` ni `modulo` la búsqueda sigue al módulo "ahora" (`getCurrentSlot` en `utils/schedule.ts`). Las búsquedas con filtros se registran en el historial tras 1,5 s.
- **Tailwind v4** vía `@tailwindcss/vite`; no hay `tailwind.config`. El tema de `docs/DESIGN.md` está en el bloque `@theme` de `src/index.css`: colores (`bg-primary`, `text-on-surface-variant`, `bg-status-free-container`…), tipografía (`text-headline-lg`, `text-label-mono`, `text-badge-status`…, fuente Geist), espaciados (`p-margin`, `md:p-margin-tablet`, `gap-gutter`, `p-space-lg`…), `shadow-card` y `animate-pulse-dot`. Estilos mobile first (base = móvil; `sm:`/`md:`/`lg:` para pantallas mayores); objetivos táctiles de 44 px en móvil.
- **Componentes base** en `components/ui/` (`Button`, `ButtonLink`, `TextField`, `Select`, `Textarea`, `Checkbox`, `SearchField`, `Chip`/`ChipGroup`, `SegmentedControl`, `Modal`, `Alert`, `EmptyState`, `Skeleton`, `Divider`, `Icon`, `Logo`, `Spinner`, `Toast`). Componentes de salas en `components/rooms/` (`RoomCard`, `RoomCompactList`, `StatusBadge`, `RoomFilters`, `RoomDetailPanel`…; estilos de estado en `roomPresentation.ts`) de reportes en `components/reports/` (`ReportModal`, `ReportStatusBadge`) y de la cuenta del usuario en `components/account/`. `Panel` (ui) es la tarjeta de sección con título. Reutilizarlos antes de crear estilos nuevos; las clases compartidas viven en `buttonStyles.ts` y `fieldStyles.ts`.
- **Íconos:** Material Symbols vía Google Fonts, siempre con `<Icon name="..." />` (clase propia `.ms-icon`; no usar `.material-symbols-outlined`, cuya hoja no está en una capa y pisa los tamaños `text-*`).

## Convenciones

- TypeScript estricto con `noUncheckedIndexedAccess`: los accesos por índice devuelven `T | undefined` y hay que manejarlos.
- `verbatimModuleSyntax` está activo: usar `import type` para importaciones de solo tipos.
- oxlint marca `react(set-state-in-effect)`: no llamar `setState` de forma síncrona dentro de `useEffect`; derivar el estado durante el render (ver cómo se calcula `loading` en `SearchPage.tsx` o `RoomDetailPanel.tsx`, comparando la clave de lo cargado con la consultada).
- `react/only-export-components`: los contextos y hooks van en archivos `.ts` separados del componente proveedor (ej. `auth-context.ts` / `AuthProvider.tsx`).
- Flujo de trabajo: ramas + pull requests en GitHub; no trabajar directamente en `main`.
