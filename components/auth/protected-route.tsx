'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'
import { LoadingState } from '@/components/common/loading-state'
import type { UserRole } from '@/lib/types/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Boş bırakılırsa tüm oturum açmış roller erişebilir. */
  allowedRoles?: UserRole[]
  fallback?: React.ReactNode
}

/**
 * JWT yoksa /login'e yönlendirir. localStorage okunana kadar
 * bekleyerek yanlış yönlendirmeyi engeller.
 */
export function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isRestoring, session } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isRestoring && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isRestoring, isAuthenticated, router])

  if (isRestoring || !isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-md px-5 py-16">
        <LoadingState label="Oturumun kontrol ediliyor…" variant="spinner" />
      </div>
    )
  }

  if (allowedRoles && session && !allowedRoles.includes(session.role)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
