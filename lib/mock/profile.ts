/**
 * GEÇİCİ ÖRNEK VERİ — profil merkezi (/profile).
 *
 * Profil ekranlarının TÜM verisi yalnızca bu dosyada tutulur. Backend hazır
 * olduğunda bu dosya tamamen kaldırılabilir: bileşenler mock veriye değil
 * lib/types/profile.ts içindeki tiplere bağlıdır.
 *
 * Devreye alırken:
 *   - MOCK_CHILDREN            -> GET /api/children
 *   - MOCK_PARENT              -> GET /api/parents/me
 *   - MOCK_TIME_BUDGET         -> ebeveyn tercih ucu
 *   - MOCK_CONSENTS            -> GET /api/consents (lib/api/consents.ts hazır)
 *   - MOCK_CONSENTS_STATUS     -> gerçek yükleme durumuyla değiştirilecek
 */

import type {
  ChildProfile,
  ConsentPreference,
  ConsentsStatus,
  ParentProfile,
  TimeBudgetValue,
} from '@/lib/types/profile'

export const MOCK_CHILDREN: ChildProfile[] = [
  {
    summary: {
      childId: 'child-deniz',
      name: 'Deniz',
      avatarUrl: '/placeholder-user.jpg',
      ageLabel: '5 yaş',
      birthDateLabel: '12 Mart 2021',
      highlights: ['5 yaş', 'Hareketli oyunları seviyor', 'Ev içi etkinlikler'],
    },
    onboardingAnswers: [
      { id: 'age', question: 'Çocuğun kaç yaşında?', answer: '5 yaşında' },
      {
        id: 'interests',
        question: 'En çok hangi etkinliklerden hoşlanıyor?',
        answer: 'Boyama, hareket ve müzik',
      },
      { id: 'place', question: 'Etkinlikler genellikle nerede yapılacak?', answer: 'Evde' },
      {
        id: 'attention',
        question: 'Dikkatini ne kadar süre koruyabiliyor?',
        answer: 'Yaklaşık 15 dakika',
      },
      {
        id: 'support',
        question: 'Etkinlikler sırasında yanında biri oluyor mu?',
        answer:
          'Genellikle ben eşlik ediyorum. Akşamüstü ablası da katılıyor, o zaman daha uzun süre oyuna devam edebiliyor.',
      },
    ],
    suggestedActivities: [
      {
        id: 'renk-avi',
        title: 'Evde renk avı',
        description:
          'Evin içinde belirlediğin üç rengi birlikte arayın. Bulduğunuz nesneleri masada küçük bir koleksiyona dönüştürün.',
        duration: '15 dakika',
        place: 'Ev içi',
        skill: 'Dikkat & eşleştirme',
        suggestedAtLabel: '4 Ağustos',
        status: 'completed',
        tone: 'primary',
      },
      {
        id: 'hikaye-tamamlama',
        title: 'Hikâye tamamlama',
        description:
          'Sen bir cümle söyle, o devam etsin. Kısa bir hikâyeyi sırayla birlikte tamamlayın.',
        duration: '20 dakika',
        place: 'Sakin zaman',
        skill: 'Dil gelişimi',
        suggestedAtLabel: '2 Ağustos',
        status: 'completed',
        tone: 'orange',
      },
      {
        id: 'yastik-parkuru',
        title: 'Yastık parkuru',
        description:
          'Yastık ve battaniyelerle küçük bir parkur kurun. Her turda yeni bir hareket ekleyin.',
        duration: '25 dakika',
        place: 'Ev içi',
        skill: 'Kaba motor',
        suggestedAtLabel: '30 Temmuz',
        status: 'pending',
        tone: 'purple',
      },
    ],
  },
  {
    summary: {
      childId: 'child-ece',
      name: 'Ece',
      avatarUrl: null,
      ageLabel: '3 yaş',
      birthDateLabel: '8 Kasım 2022',
      highlights: ['3 yaş', 'Sakin oyunları seviyor'],
    },
    // Eksik onboarding durumunu göstermek için bilinçli olarak boş bırakıldı.
    onboardingAnswers: [],
    // Henüz öneri almamış çocuk durumu.
    suggestedActivities: [],
  },
]

export const MOCK_PARENT: ParentProfile = {
  firstName: 'Selin',
  lastName: 'Yılmaz',
  email: 'selin.yilmaz@example.com',
  // Telefonu olmayan hesap durumunu göstermek için boş bırakıldı.
  phone: '',
  avatarUrl: null,
}

export const MOCK_TIME_BUDGET: TimeBudgetValue = '30'

export const MOCK_CONSENTS_STATUS: ConsentsStatus = 'ready'

export const MOCK_CONSENTS: ConsentPreference[] = [
  {
    consentId: 1,
    type: 'TERMS',
    title: 'Kullanım Koşulları',
    summary: 'Kidloop’u kullanırken geçerli olan temel kuralları kapsar.',
    required: true,
    granted: true,
    version: '1.0',
  },
  {
    consentId: 2,
    type: 'PRIVACY',
    title: 'Gizlilik Politikası',
    summary: 'Hangi verileri topladığımızı ve nasıl koruduğumuzu açıklar.',
    required: true,
    granted: true,
    version: '1.0',
  },
  {
    consentId: 3,
    type: 'KVKK',
    title: 'KVKK Aydınlatma ve Açık Rıza',
    summary: 'Kişisel verilerinin işlenmesine dair yasal bilgilendirmeyi içerir.',
    required: true,
    granted: true,
    version: '1.1',
  },
  {
    consentId: 4,
    type: 'DATA_PROCESSING',
    title: 'Kişisel Verilerin İşlenmesi',
    summary: 'Etkinlik önerilerini kişiselleştirmek için verilerin işlenmesini kapsar.',
    required: true,
    granted: false,
    version: '1.0',
  },
  {
    consentId: 5,
    type: 'MARKETING',
    title: 'Pazarlama İletişimi',
    summary: 'Yeni özellikler ve öneriler için e-posta almayı seçebilirsin.',
    required: false,
    granted: false,
    version: '1.0',
  },
]

/**
 * İzin metinleri backend'den (GET /api/consents -> content) gelir.
 * Burada yalnızca yer tutucu bir özet gösterilir.
 */
export const CONSENT_PLACEHOLDER_TEXT =
  'Bu iznin tam metni onay kaydıyla birlikte saklanır ve sürüm bilgisiyle birlikte gösterilir. Metnin güncel sürümünü onboarding adımındaki izin ekranından da inceleyebilirsin.'
