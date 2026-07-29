import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { ComingSoon } from '@/components/common/coming-soon'
import { IdentityForm } from '@/components/onboarding/identity-form'

export const metadata: Metadata = {
  title: 'Çocuğunu tanıtalım',
  description: 'Kidloop onboarding: çocuğunun adı ve doğum tarihi.',
}

export default function OnboardingIdentityPage() {
  return (
    <ProtectedRoute allowedRoles={['PARENT']} fallback={<AppShell><ComingSoon /></AppShell>}>
      <AppShell>
        <IdentityForm />
      </AppShell>
    </ProtectedRoute>
  )
}
