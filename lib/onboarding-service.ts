import { MOCK_CHILD, MOCK_QUESTIONS } from './onboarding-data'
import type { Child, OnboardingAnswer, QuestionnaireQuestion } from './onboarding-types'

/**
 * Mock service layer for the onboarding questionnaire.
 *
 * These functions intentionally mirror the shape of the future REST API so the
 * UI can be wired to real endpoints later without structural changes:
 *
 *   GET  /api/children/{childId}/onboarding-questions
 *   POST /api/children/{childId}/onboarding-answers
 *   POST /api/children/{childId}/calculate-profile
 *
 * Replace the mock bodies with `fetch(...)` calls when the backend is ready.
 */

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type OnboardingQuestionsResponse = {
  child: Child
  questions: QuestionnaireQuestion[]
}

/** GET /api/children/{childId}/onboarding-questions */
export async function getOnboardingQuestions(
  childId: string,
): Promise<OnboardingQuestionsResponse> {
  await delay(650)

  // Simulated network error hook — flip to true to exercise the error state.
  const shouldFail = false
  if (shouldFail) {
    throw new Error('Sorular yüklenemedi')
  }

  return {
    child: { ...MOCK_CHILD, id: childId || MOCK_CHILD.id },
    questions: MOCK_QUESTIONS,
  }
}

/** POST /api/children/{childId}/onboarding-answers */
export async function saveOnboardingAnswers(
  childId: string,
  answers: OnboardingAnswer[],
): Promise<{ saved: boolean }> {
  await delay(500)
  console.log('[v0] saveOnboardingAnswers', { childId, answers })
  return { saved: true }
}

export type ChildProfileResult = {
  dominantArchetype: string
  isMixed: boolean
}

/** POST /api/children/{childId}/calculate-profile */
export async function calculateChildProfile(
  childId: string,
  answers: OnboardingAnswer[],
): Promise<ChildProfileResult> {
  await delay(1400)
  console.log('[v0] calculateChildProfile', { childId, answers })

  const mixedCount = answers.filter((a) => a.isMixed).length
  return {
    dominantArchetype: 'enerjik kaşif',
    isMixed: mixedCount >= 3,
  }
}
