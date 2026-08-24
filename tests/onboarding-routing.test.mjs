import assert from 'node:assert/strict'
import test from 'node:test'
import { onboardingContinuationPath, routeForHomeStatus } from '../lib/app/routes.mjs'

const child = {
  childId: 46,
  fullName: 'Ada',
  displayName: 'Ada',
  birthDate: '2024-11-10',
  ageMonths: 21,
  ageBand: 'BAND_12_24',
  gender: 'FEMALE',
}

function halfStatus(onboardingStep, overrides = {}) {
  return {
    state: 'half-onboarding-user',
    childId: 46,
    childName: 'Ada',
    child,
    onboardingStep,
    nextQuestionCode: null,
    nextConsentId: null,
    shouldGenerateDailyPlan: false,
    ...overrides,
  }
}

test('new users retain the welcome home before starting identity', () => {
  assert.equal(routeForHomeStatus({ state: 'new-user' }), '/home')
})

test('daily-time-budget resumes with the backend child id', () => {
  assert.equal(routeForHomeStatus(halfStatus('DAILY_TIME_BUDGET')), '/home')
  assert.equal(
    onboardingContinuationPath(halfStatus('DAILY_TIME_BUDGET')),
    '/onboarding/46/daily-time-budget',
  )
})

test('questionnaire resumes at nextQuestionCode', () => {
  assert.equal(routeForHomeStatus(halfStatus('QUESTIONNAIRE')), '/home')
  assert.equal(
    onboardingContinuationPath(halfStatus('QUESTIONNAIRE', { nextQuestionCode: 'Q 4' })),
    '/onboarding/46/questions?next=Q%204',
  )
})

test('consents resumes at nextConsentId', () => {
  assert.equal(routeForHomeStatus(halfStatus('CONSENTS')), '/home')
  assert.equal(
    onboardingContinuationPath(halfStatus('CONSENTS', { nextConsentId: 17 })),
    '/onboarding/46/consents?consentId=17',
  )
})

test('feedback and returning users stay on home', () => {
  assert.equal(routeForHomeStatus({ state: 'feedback-required' }), '/home')
  assert.equal(routeForHomeStatus({ state: 'returning-user' }), '/home')
})

test('unknown states and steps fail instead of causing a redirect loop', () => {
  assert.throws(() => routeForHomeStatus({ state: 'unexpected' }), /Unsupported home state/)
  assert.throws(
    () => onboardingContinuationPath(halfStatus('UNEXPECTED_STEP')),
    /Unsupported onboarding step/,
  )
})
