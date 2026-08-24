'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthSession } from '@/lib/types/auth'
import type { HomeStatus } from '@/lib/types/home'
import { UNAUTHORIZED_EVENT } from '@/lib/api/client'
import { resolveInitialRoute, type InitialRouteResolution } from '@/lib/app/bootstrap'
import {
  clearSession,
  readActiveChild,
  readSession,
  writeActiveChild,
  writeSession,
  type StoredChild,
} from '@/lib/auth/storage'

interface AuthContextValue {
  session: AuthSession | null
  /** localStorage okunana kadar true — korumalı sayfalarda yanlış yönlendirmeyi engeller */
  isRestoring: boolean
  isAuthenticated: boolean
  activeChild: StoredChild | null
  homeStatus: HomeStatus | null
  /** remember=false ise oturum yalnızca sekme açık kaldığı sürece saklanır */
  signIn: (session: AuthSession, remember?: boolean) => void
  signOut: () => void
  setActiveChild: (child: StoredChild) => void
  resolveHomeStatus: () => Promise<InitialRouteResolution>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [activeChild, setActiveChildState] = useState<StoredChild | null>(null)
  const [homeStatus, setHomeStatus] = useState<HomeStatus | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  // Oturum durumu istemci tarafında güvenli şekilde geri yüklenir.
  useEffect(() => {
    setSession(readSession())
    setActiveChildState(readActiveChild())
    setIsRestoring(false)
  }, [])

  const signIn = useCallback((next: AuthSession, remember = true) => {
    writeSession(next, remember)
    setSession(next)
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    setSession(null)
    setActiveChildState(null)
    setHomeStatus(null)
  }, [])

  const setActiveChild = useCallback((child: StoredChild) => {
    writeActiveChild(child)
    setActiveChildState(child)
  }, [])

  const resolveHomeStatus = useCallback(async () => {
    const resolution = await resolveInitialRoute()
    setHomeStatus(resolution.status)
    if (resolution.status.state !== 'new-user') {
      const status = resolution.status
      const child = status.state === 'half-onboarding-user' ? status.child : null
      setActiveChild({
        ...(activeChild?.childId === String(status.childId) ? activeChild : null),
        childId: String(status.childId),
        childName: status.childName,
        ...(child
          ? {
              fullName: child.fullName,
              displayName: child.displayName ?? status.childName,
              birthDate: child.birthDate,
              ageMonths: child.ageMonths,
              ageBand: child.ageBand,
              gender: child.gender,
            }
          : null),
      })
    }
    return resolution
  }, [activeChild, setActiveChild])

  // Token geçersizleştiğinde (401) oturum otomatik kapatılır; korumalı
  // sayfalar bu durumda kullanıcıyı /login ekranına yönlendirir.
  useEffect(() => {
    const handleUnauthorized = () => signOut()
    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized)
  }, [signOut])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isRestoring,
      isAuthenticated: Boolean(session?.token),
      activeChild,
      homeStatus,
      signIn,
      signOut,
      setActiveChild,
      resolveHomeStatus,
    }),
    [session, isRestoring, activeChild, homeStatus, signIn, signOut, setActiveChild, resolveHomeStatus],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth yalnızca AuthProvider içinde kullanılabilir.')
  }
  return context
}
