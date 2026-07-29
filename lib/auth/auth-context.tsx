'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { AuthSession } from '@/lib/types/auth'
import { UNAUTHORIZED_EVENT } from '@/lib/api/client'
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
  /** remember=false ise oturum yalnızca sekme açık kaldığı sürece saklanır */
  signIn: (session: AuthSession, remember?: boolean) => void
  signOut: () => void
  setActiveChild: (child: StoredChild) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [activeChild, setActiveChildState] = useState<StoredChild | null>(null)
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
  }, [])

  const setActiveChild = useCallback((child: StoredChild) => {
    writeActiveChild(child)
    setActiveChildState(child)
  }, [])

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
      signIn,
      signOut,
      setActiveChild,
    }),
    [session, isRestoring, activeChild, signIn, signOut, setActiveChild],
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
