import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminLayout from '../layouts/AdminLayout'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
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
    children: [{ index: true, element: <AdminDashboardPage /> }],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/salas', element: <SearchPage /> },
      // En escritorio el detalle se abre como panel lateral; en móvil, como página.
      { path: '/salas/:roomId', element: <SearchPage /> },
      { path: '/favoritos', element: <FavoritesReportsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
