import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { ComingSoon } from '@/components/common/coming-soon'
import { QuestionnaireComplete } from '@/components/onboarding/questionnaire-complete'

export const metadata: Metadata = {
  title: 'Sorular tamamlandı',
  description: 'Onboarding cevaplarını gözden geçir ve planını hazırla.',
}

export default async function QuestionnaireCompletePage({
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
        <QuestionnaireComplete childId={childId} />
      </AppShell>
    </ProtectedRoute>
  )
}
