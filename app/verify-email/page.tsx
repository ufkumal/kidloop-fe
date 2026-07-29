import { Suspense } from 'react'
import type { Metadata } from 'next'
import { AuthLayout } from '@/components/auth/auth-layout'
import { VerifyEmailPanel } from '@/components/auth/verify-email-panel'
import { AuthCard } from '@/components/auth/auth-card'
import { LoadingState } from '@/components/common/loading-state'

export const metadata: Metadata = {
  title: 'E-posta doğrulama',
  description: 'Kidloop hesabının e-posta adresini doğrula.',
}

export default function VerifyEmailPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <AuthCard title="E-postan doğrulanıyor" description="Bağlantını kontrol ediyoruz.">
            <LoadingState label="E-postan doğrulanıyor…" variant="spinner" />
          </AuthCard>
        }
      >
        <VerifyEmailPanel />
      </Suspense>
    </AuthLayout>
  )
}
