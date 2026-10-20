# SalasUC — Frontend

Aplicación web para consultar qué salas de Ingeniería UC (edificios A, B, BC y K) están libres por día y módulo horario.

## Stack

React + Vite · TypeScript (estricto) · Tailwind CSS (mobile first) · React Router DOM

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # chequeo de tipos + build de producción
npm run lint     # oxlint
```

## Datos: mock vs. API real

Los componentes solo consumen funciones de `src/services`. Mientras `VITE_API_URL` no esté definida, los servicios entregan datos de prueba (`src/services/mock/data.ts`).

Para usar el backend, crea un `.env.local` (ver `.env.example`):

```
VITE_API_URL=https://api.ejemplo.cl
```

Los endpoints usados (`/buildings`, `/rooms`, `/days`, `/modules`, `/availability`, `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`) son tentativos y deben alinearse con el equipo backend.

### Cuentas de prueba (modo mock)

| Rol        | Correo             | Contraseña   |
| ---------- | ------------------ | ------------ |
| Admin      | `admin@uc.cl`      | `admin1234`  |
| Estudiante | `estudiante@uc.cl` | `salasuc123` |

La cuenta de estudiante parte con favoritos, historial y reportes de demostración. Las cuentas creadas en `/registro` se guardan en el `localStorage` del navegador. También se puede entrar como invitado.

## Estructura

```
src/
├── components/   componentes reutilizables (ui/ = componentes base del sistema de diseño)
├── context/      sesión (AuthProvider) y notificaciones (ToastProvider)
├── layouts/      layouts de página
├── pages/        vistas asociadas a rutas
├── routes/       configuración de React Router
├── services/     acceso a datos (mock / API)
├── types/        tipos del dominio
└── utils/        utilidades (clases CSS, validaciones)
```

El sistema de diseño (colores, tipografía Geist, bordes, sombras, espaciados) está en `docs/DESIGN.md` y se traduce a tokens de Tailwind en `src/index.css` (`@theme`).
