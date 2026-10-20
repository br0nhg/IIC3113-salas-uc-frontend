import { createContext, useContext } from 'react'
import type { AuthSession, LoginInput, RegisterInput, User } from '../types'

export interface AuthContextValue {
  user: User | null
  session: AuthSession | null
  login: (input: LoginInput) => Promise<User>
  register: (input: RegisterInput) => Promise<User>
  loginAsGuest: () => User
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/** Solo los usuarios con cuenta pueden guardar favoritos, historial y reportes. */
export function hasAccount(user: User | null): boolean {
  return user !== null && user.role !== 'guest'
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
