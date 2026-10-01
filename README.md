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

Los endpoints usados (`/buildings`, `/rooms`, `/days`, `/modules`, `/availability`) son tentativos y deben alinearse con el equipo backend.

## Estructura

```
src/
├── components/   componentes reutilizables
├── layouts/      layouts de página (header, footer)
├── pages/        vistas asociadas a rutas
├── routes/       configuración de React Router
├── services/     acceso a datos (mock / API)
└── types/        tipos del dominio
```
