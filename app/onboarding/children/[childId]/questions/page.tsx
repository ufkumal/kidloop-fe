import { SiteHeader } from '@/components/site-header'
import { QuestionnaireFlow } from '@/components/onboarding/questionnaire-flow'

type QuestionsPageProps = {
  params: Promise<{ childId: string }>
}

export default async function QuestionsPage({ params }: QuestionsPageProps) {
  const { childId } = await params

  return (
    <div className="min-h-dvh bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-14">
        <QuestionnaireFlow childId={childId} />
      </main>
    </div>
  )
}
