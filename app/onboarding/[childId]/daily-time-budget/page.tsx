import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { ComingSoon } from '@/components/common/coming-soon'
import { AppShell } from '@/components/layout/app-shell'
import { DailyTimeBudgetStep } from '@/components/onboarding/daily-time-budget-step'

export const metadata: Metadata = {
  title: 'Günlük zaman bütçesi',
  description: 'Etkinlik önerileri için günlük ayırabileceğin süreyi seç.',
}

export default async function DailyTimeBudgetPage({
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
        <DailyTimeBudgetStep childId={childId} />
      </AppShell>
    </ProtectedRoute>
  )
}
