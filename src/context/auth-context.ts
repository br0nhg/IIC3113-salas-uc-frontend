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

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return value
}
