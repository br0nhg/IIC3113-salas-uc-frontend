import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import AccountPage from '../pages/AccountPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import AdminReportsPage from '../pages/admin/AdminReportsPage'
import AdminReservationsPage from '../pages/admin/AdminReservationsPage'
import RegisterPage from '../pages/auth/RegisterPage'
import WelcomePage from '../pages/auth/WelcomePage'
import FavoritesReportsPage from '../pages/FavoritesReportsPage'
import NotFoundPage from '../pages/NotFoundPage'
import SearchPage from '../pages/SearchPage'
import RequireRole from './RequireRole'

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/', element: <WelcomePage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
  {
    path: '/admin',
    element: (
      <RequireRole role="admin">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'reservas', element: <AdminReservationsPage /> },
      { path: 'reportes', element: <AdminReportsPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/salas', element: <SearchPage /> },
      // En escritorio el detalle se abre como panel lateral; en móvil, como página.
      { path: '/salas/:roomId', element: <SearchPage /> },
      { path: '/favoritos', element: <FavoritesReportsPage /> },
      { path: '/cuenta', element: <AccountPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
