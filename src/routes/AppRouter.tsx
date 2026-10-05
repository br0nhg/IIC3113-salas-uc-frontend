import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import RegisterPage from '../pages/auth/RegisterPage'
import WelcomePage from '../pages/auth/WelcomePage'
import NotFoundPage from '../pages/NotFoundPage'
import SearchPage from '../pages/SearchPage'

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/', element: <WelcomePage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/salas', element: <SearchPage /> },
      // En escritorio el detalle se abre como panel lateral; en móvil, como página.
      { path: '/salas/:roomId', element: <SearchPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
