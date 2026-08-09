/**
 * Profil merkezi tipleri.
 *
 * Bileşenler yalnızca bu tiplere bağlıdır; veri kaynağı şu an
 * lib/mock/profile.ts içindeki geçici örnek veridir. Backend hazır
 * olduğunda mock dosyası kaldırılıp aynı tipler API yanıtlarına bağlanır.
 */

/** Etkinlik kartlarındaki yumuşak renk yüzeyi. */
export type ProfileTone = 'primary' | 'orange' | 'purple'

export interface ChildProfileSummary {
  childId: string
  name: string
  /** Boş bırakılabilir; yoksa baş harf avatarı gösterilir. */
  avatarUrl?: string | null
  ageLabel?: string | null
  birthDateLabel?: string | null
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
  place: string
  skill: string
  suggestedAtLabel: string
  status: SuggestedActivityStatus
  tone: ProfileTone
}

export interface ChildProfile {
  summary: ChildProfileSummary
  onboardingAnswers: OnboardingAnswer[]
  suggestedActivities: SuggestedActivity[]
}

export interface ParentProfile {
  firstName: string
  lastName: string
  email: string
  /** Telefon eklenmemiş hesaplarda boş string kalır. */
  phone: string
  avatarUrl?: string | null
}

/** Dakika cinsinden günlük zaman bütçesi; 'custom' özel süre girişini açar. */
export type TimeBudgetValue = '15' | '30' | '45' | '60' | 'custom'

export interface ConsentPreference {
  consentId: number
  /** Mevcut backend consent tipleriyle hizalı. */
  type: 'TERMS' | 'PRIVACY' | 'KVKK' | 'DATA_PROCESSING' | 'MARKETING'
  title: string
  summary: string
  required: boolean
  granted: boolean
  version: string
}

/** İzin listesinin yüklenme durumu; kart bu duruma göre iskelet/boş/hata gösterir. */
export type ConsentsStatus = 'loading' | 'ready' | 'empty' | 'error'
