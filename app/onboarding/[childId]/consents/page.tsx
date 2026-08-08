import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ComingSoon } from '@/components/common/coming-soon'
import { AppShell } from '@/components/layout/app-shell'
import { ConsentStep } from '@/components/onboarding/consent-step'

export const metadata: Metadata = {
  title: 'İzinler',
  description: 'Plan hazırlanmadan önce gerekli izinleri incele ve tercihlerini belirt.',
}

export default async function ConsentsPage({
  params,
}: {
  params: Promise<{ childId: string }>
}) {
  const { childId } = await params

  return (
    <ProtectedRoute
      allowedRoles={['PARENT']}
      fallback={
        <AppShell>
          <ComingSoon />
        </AppShell>
      }
    >
      <AppShell>
        <ConsentStep childId={childId} />
      </AppShell>
    </ProtectedRoute>
  )
}
