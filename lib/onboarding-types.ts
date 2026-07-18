export type QuestionnaireOption = {
  id: string
  title: string
  archetype: string
  scoreValue: number
}

export type QuestionnaireQuestion = {
  id: number
  text: string
  options: QuestionnaireOption[]
  allowMixedAnswer: boolean
}

export type Child = {
  id: string
  name: string
  ageLabel: string
  initial: string
}

export type OnboardingAnswer = {
  questionId: number
  optionId: string
  isMixed: boolean
}

/** Special option id used when the parent picks the "it depends" response. */
export const MIXED_OPTION_ID = 'mixed'
