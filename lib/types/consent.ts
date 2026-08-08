export type ConsentType = 'TERMS' | 'PRIVACY' | 'KVKK' | 'MARKETING' | 'DATA_PROCESSING' | string

export interface Consent {
  consentId: number
  type: ConsentType
  version: string
  title: string
  summary: string
  content: string
  required: boolean
  effectiveAt: string
  granted: boolean | null
  respondedAt: string | null
}

export interface ConsentDecision {
  granted: boolean
}
