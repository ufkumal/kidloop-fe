import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ComingSoon } from '@/components/common/coming-soon'
import { AppShell } from '@/components/layout/app-shell'
import { IdentityForm } from '@/components/onboarding/identity-form'

export const metadata: Metadata = {
  title: 'Çocuk bilgilerini düzenle',
  description: 'Çocuğunun kimlik bilgilerini güncelle.',
}

export default async function EditChildIdentityPage({
  params,
  searchParams,
}: {
  params: Promise<{ childId: string }>
  searchParams: Promise<{ returnTo?: string | string[] }>
}) {
  const { childId } = await params
  const rawReturnTo = (await searchParams).returnTo
  const requestedReturnTo = Array.isArray(rawReturnTo) ? rawReturnTo[0] : rawReturnTo
  const returnTo =
    requestedReturnTo?.startsWith('/onboarding/') || requestedReturnTo === '/profile'
      ? requestedReturnTo
      : '/profile'

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
        <IdentityForm editChildId={childId} returnTo={returnTo} />
      </AppShell>
    </ProtectedRoute>
  )
}
