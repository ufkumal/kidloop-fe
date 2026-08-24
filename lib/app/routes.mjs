/**
 * @param {import('../types/home').HomeStatus} status
 * @returns {string}
 */
export function routeForHomeStatus(status) {
  switch (status.state) {
    case 'new-user':
    case 'half-onboarding-user':
    case 'feedback-required':
    case 'returning-user':
      return '/home'
    default:
      throw new Error(`Unsupported home state: ${String(status.state)}`)
  }
}

/**
 * @param {Extract<import('../types/home').HomeStatus, {state: 'half-onboarding-user'}>} status
 * @returns {string}
 */
export function onboardingContinuationPath(status) {
  const childId = encodeURIComponent(status.childId)
  switch (status.onboardingStep) {
    case 'DAILY_TIME_BUDGET':
      return `/onboarding/${childId}/daily-time-budget`
    case 'QUESTIONNAIRE': {
      const query = status.nextQuestionCode
        ? `?next=${encodeURIComponent(status.nextQuestionCode)}`
        : ''
      return `/onboarding/${childId}/questions${query}`
    }
    case 'CONSENTS': {
      const query = status.nextConsentId
        ? `?consentId=${encodeURIComponent(status.nextConsentId)}`
        : ''
      return `/onboarding/${childId}/consents${query}`
    }
    default:
      throw new Error(`Unsupported onboarding step: ${String(status.onboardingStep)}`)
  }
}
