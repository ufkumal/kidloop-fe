/** Profil merkezinin API yanıtlarından normalize edilen görünüm tipleri. */

/** Etkinlik kartlarındaki yumuşak renk yüzeyi. */
export type ProfileTone = 'primary' | 'orange' | 'purple'

export interface ChildProfileSummary {
  childId: string
  name: string
  /** Boş bırakılabilir; yoksa baş harf avatarı gösterilir. */
  avatarUrl?: string | null
  ageLabel?: string | null
  birthDateLabel?: string | null
  /** API düzenleme formu için ham YYYY-MM-DD değeri. */
  birthDate?: string | null
  gender?: string | null
  /** Kısa özet etiketleri: "5 yaş", "Hareketli oyunları seviyor" vb. */
  highlights: string[]
}

export interface OnboardingAnswer {
  id: string
  question: string
  /** Cevap verilmemiş sorularda null bırakılır. */
  answer: string | null
}

export type SuggestedActivityStatus = 'completed' | 'pending'

export interface SuggestedActivity {
  id: string
  title: string
  description: string
  duration: string
  involvement: string
  skill: string
  suggestedAtLabel: string
  status: SuggestedActivityStatus
  tone: ProfileTone
}

export interface ChildProfile {
  summary: ChildProfileSummary
  onboardingAnswers: OnboardingAnswer[]
}

export interface ParentProfile {
  fullName: string
  email: string
  /** Telefon eklenmemiş hesaplarda boş string kalır. */
  phone: string
  city: string
  district: string
  avatarUrl?: string | null
}

export interface DailyTimeBudgetOption {
  code: string
  label: string
  displayOrder: number
  minutes: number
}

export interface DailyTimeBudget {
  questionCode: string
  question: string
  selectedOptionCode: string | null
  dailyTimeBudgetMinutes: number | null
  options: DailyTimeBudgetOption[]
}

export interface DailyTimeBudgetUpdate {
  answeredOptionCode: string
  dailyTimeBudgetMinutes: number
}

export interface ProfileData {
  parent: ParentProfile
  children: ChildProfile[]
}
