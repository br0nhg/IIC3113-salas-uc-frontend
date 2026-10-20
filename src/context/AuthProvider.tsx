import { useMemo, useState, type ReactNode } from 'react'
import { authService } from '../services'
import type { AuthSession } from '../types'
import { AuthContext, type AuthContextValue } from './auth-context'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getStoredSession())

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      async login(input) {
        const next = await authService.login(input)
        setSession(next)
        return next.user
      },
      async register(input) {
        const next = await authService.register(input)
        setSession(next)
        return next.user
      },
      loginAsGuest() {
        const next = authService.loginAsGuest()
        setSession(next)
        return next.user
      },
      async logout() {
        await authService.logout()
        setSession(null)
      },
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
