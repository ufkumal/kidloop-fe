'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'
import { OnboardingSidebar } from '@/components/onboarding/onboarding-sidebar'
import { QuestionCard } from '@/components/onboarding/question-card'
import { CompletionCard } from '@/components/onboarding/completion-card'
import { Button } from '@/components/ui/button'
import {
  calculateChildProfile,
  getOnboardingQuestions,
  saveOnboardingAnswers,
} from '@/lib/onboarding-service'
import type { Child, OnboardingAnswer, QuestionnaireQuestion } from '@/lib/onboarding-types'

type LoadState = 'loading' | 'error' | 'empty' | 'ready'
type Phase = 'questions' | 'completed'

type QuestionnaireFlowProps = {
  childId: string
}

export function QuestionnaireFlow({ childId }: QuestionnaireFlowProps) {
  const router = useRouter()

  const [loadState, setLoadState] = useState<LoadState>('loading')
  const [child, setChild] = useState<Child | null>(null)
  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([])

  const [answers, setAnswers] = useState<Record<number, OnboardingAnswer>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<Phase>('questions')
  const [isSaving, setIsSaving] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)

  async function loadQuestions() {
    setLoadState('loading')
    try {
      const data = await getOnboardingQuestions(childId)
      if (!data.questions || data.questions.length === 0) {
        setLoadState('empty')
        return
      }
      setChild(data.child)
      setQuestions(data.questions)
      setLoadState('ready')
    } catch (error) {
      console.log('[v0] getOnboardingQuestions failed', error)
      setLoadState('error')
    }
  }

  useEffect(() => {
    loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [childId])

  const answeredCount = Object.keys(answers).length

  function handleSelect(questionId: number, optionId: string, isMixed: boolean) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: { questionId, optionId, isMixed },
    }))
  }

  async function handleContinue() {
    const isLast = currentIndex === questions.length - 1
    setIsSaving(true)
    try {
      await saveOnboardingAnswers(childId, Object.values(answers))
      if (isLast) {
        setPhase('completed')
      } else {
        setCurrentIndex((i) => i + 1)
      }
    } finally {
      setIsSaving(false)
    }
  }

  function handlePrevious() {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }

  function handleReview() {
    setPhase('questions')
    setCurrentIndex(questions.length - 1)
  }

  async function handleCreatePlan() {
    setIsCalculating(true)
    try {
      await calculateChildProfile(childId, Object.values(answers))
      router.push(`/children/${childId}/today`)
    } catch (error) {
      console.log('[v0] calculateChildProfile failed', error)
      setIsCalculating(false)
    }
  }

  // --- Loading state ---
  if (loadState === 'loading') {
    return (
      <StatusPanel>
        <Loader2 className="size-8 animate-spin text-pine" />
        <p className="mt-4 font-medium text-ink">Sorular hazırlanıyor…</p>
        <p className="mt-1 text-sm text-muted-foreground">Bir saniye sürmez.</p>
      </StatusPanel>
    )
  }

  // --- Error state ---
  if (loadState === 'error') {
    return (
      <StatusPanel>
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertCircle className="size-7" />
        </span>
        <p className="mt-4 font-medium text-ink">Sorular yüklenemedi</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Bağlantında bir sorun olmuş olabilir. Lütfen tekrar dene.
        </p>
        <Button
          onClick={loadQuestions}
          className="mt-6 h-11 rounded-xl bg-pine px-5 text-pine-foreground hover:bg-pine/90"
        >
          <RefreshCw className="size-4" />
          Tekrar dene
        </Button>
      </StatusPanel>
    )
  }

  // --- Empty state ---
  if (loadState === 'empty' || !child) {
    return (
      <StatusPanel>
        <p className="font-medium text-ink">Şu an gösterilecek soru yok</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          Bu çocuk için tanışma soruları henüz tanımlanmamış.
        </p>
      </StatusPanel>
    )
  }

  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers[currentQuestion.id]

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-12">
      <div className="lg:sticky lg:top-24 lg:self-start">
        <OnboardingSidebar
          child={child}
          answeredCount={answeredCount}
          totalQuestions={questions.length}
        />
      </div>

      <div>
        {phase === 'questions' ? (
          <QuestionCard
            child={child}
            question={currentQuestion}
            index={currentIndex}
            total={questions.length}
            selectedOptionId={currentAnswer?.optionId}
            onSelect={(optionId, isMixed) => handleSelect(currentQuestion.id, optionId, isMixed)}
            onPrevious={handlePrevious}
            onContinue={handleContinue}
            isSaving={isSaving}
          />
        ) : (
          <CompletionCard
            child={child}
            questions={questions}
            answeredCount={answeredCount}
            isCalculating={isCalculating}
            onCreatePlan={handleCreatePlan}
            onReview={handleReview}
          />
        )}
      </div>
    </div>
  )
}

function StatusPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center">
      {children}
    </div>
  )
}
