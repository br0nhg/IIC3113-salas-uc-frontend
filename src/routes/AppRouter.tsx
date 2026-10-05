import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AuthLayout from '../layouts/AuthLayout'
import MainLayout from '../layouts/MainLayout'
import RegisterPage from '../pages/auth/RegisterPage'
import WelcomePage from '../pages/auth/WelcomePage'
import HomePage from '../pages/HomePage'
import NotFoundPage from '../pages/NotFoundPage'

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/', element: <WelcomePage /> },
      { path: '/registro', element: <RegisterPage /> },
    ],
  },
  {
    // Provisorio: la vista de búsqueda definitiva llega en la siguiente fase.
    element: <MainLayout />,
    children: [
      { path: '/salas', element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
