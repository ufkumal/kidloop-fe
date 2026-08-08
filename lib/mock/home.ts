/**
 * GEÇİCİ ÖRNEK VERİ — ana sayfa.
 *
 * Ana sayfanın tüm mock verisi ve mock durumu yalnızca bu dosyada tutulur.
 * Backend hazır olduğunda:
 *   - MOCK_HOME_STATE yerine kullanıcının onboarding durumu API'den okunacak,
 *   - MOCK_LAST_ACTIVITY yerine son önerilen/tamamlanan etkinlik API'den gelecek.
 * Bu dosya o aşamada tamamen kaldırılabilir; bileşenler mock veriye değil
 * lib/types/home.ts içindeki tiplere bağlıdır.
 */

import type { EnjoymentLevel, HomeState, LastActivitySummary } from '@/lib/types/home'

/** Geliştirme sırasında önizlenen başlangıç durumu. */
export const MOCK_HOME_STATE: HomeState = 'returning-user'

export const MOCK_LAST_ACTIVITY: LastActivitySummary = {
  id: 'renk-avi',
  title: 'Evde renk avı',
  duration: '15 dakika',
  place: 'Ev içi',
  skill: 'Dikkat & eşleştirme',
  completedLabel: 'Dün',
  tone: 'primary',
}

export interface EnjoymentOption {
  value: EnjoymentLevel
  label: string
}

export const ENJOYMENT_OPTIONS: EnjoymentOption[] = [
  { value: 'loved', label: 'Çok sevdi' },
  { value: 'somewhat', label: 'Biraz sevdi' },
  { value: 'not_interested', label: 'Pek ilgilenmedi' },
]

export const FEEDBACK_TAGS: string[] = [
  'Kolaydı',
  'Tam kıvamındaydı',
  'Biraz zordu',
  'Tekrar yapmak istedi',
  'Dikkatini sürdürmekte zorlandı',
  'Birlikte çok eğlendik',
]
