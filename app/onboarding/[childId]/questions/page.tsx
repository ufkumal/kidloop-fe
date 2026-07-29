import type { Metadata } from 'next'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { AppShell } from '@/components/layout/app-shell'
import { ComingSoon } from '@/components/common/coming-soon'
import { QuestionnaireFlow } from '@/components/onboarding/questionnaire-flow'

export const metadata: Metadata = {
  title: 'Onboarding soruları',
  description: 'Çocuğuna uygun etkinlikler için kısa sorular.',
}

export default async function QuestionnairePage({
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
      <AppShell width="wide">
        <QuestionnaireFlow childId={childId} />
      </AppShell>
    </ProtectedRoute>
  )
}
