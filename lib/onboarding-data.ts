import type { Child, QuestionnaireQuestion } from './onboarding-types'

export const MOCK_CHILD: Child = {
  id: 'deniz',
  name: 'Deniz',
  ageLabel: '18 ay',
  initial: 'D',
}

/**
 * Mock questionnaire data. In production this comes from
 * GET /api/children/{childId}/onboarding-questions
 */
export const MOCK_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 1,
    text: 'Deniz yeni bir oyuncakla ilk karşılaştığında genellikle ne yapar?',
    allowMixedAnswer: true,
    options: [
      { id: '1a', title: 'Uzaktan izler, önce bir süre gözlemler', archetype: 'sakin gözlemci', scoreValue: 1 },
      { id: '1b', title: 'Hemen kapar, kurcalamaya başlar', archetype: 'enerjik kaşif', scoreValue: 2 },
      { id: '1c', title: 'İlgilenir ama emin olmak için bana bakar', archetype: 'hassas izleyici', scoreValue: 3 },
      { id: '1d', title: 'Pek ilgilenmez, tanıdık oyuncağına döner', archetype: 'korunmacı', scoreValue: 4 },
    ],
  },
  {
    id: 2,
    text: 'Deniz kalabalık, müzikli bir ortama girdiğinde genellikle ne yapar?',
    allowMixedAnswer: true,
    options: [
      { id: '2a', title: 'Pek fark etmez, kendi halinde devam eder', archetype: 'sakin gözlemci', scoreValue: 1 },
      { id: '2b', title: 'Coşar — ortama atlar, her şeye dokunmak ister', archetype: 'enerjik kaşif', scoreValue: 2 },
      { id: '2c', title: 'Rahatsız olur ama sessizce katlanır', archetype: 'hassas izleyici', scoreValue: 3 },
      { id: '2d', title: 'Uzaklaşmak ister, kulaklarını kapatır', archetype: 'korunmacı', scoreValue: 4 },
    ],
  },
  {
    id: 3,
    text: 'Deniz\'in canı sıkıldığında ya da yorulduğunda ne yapmasını beklersiniz?',
    allowMixedAnswer: true,
    options: [
      { id: '3a', title: 'Sakince kendi kendine oyalanır', archetype: 'sakin gözlemci', scoreValue: 1 },
      { id: '3b', title: 'Hareketlenir, ortalıkta koşturur', archetype: 'enerjik kaşif', scoreValue: 2 },
      { id: '3c', title: 'Huzursuzlanır, yakınıma gelmek ister', archetype: 'hassas izleyici', scoreValue: 3 },
      { id: '3d', title: 'İçine kapanır, uyarılardan uzaklaşır', archetype: 'korunmacı', scoreValue: 4 },
    ],
  },
  {
    id: 4,
    text: 'Deniz yeni insanlarla tanıştığında nasıl bir tepki verir?',
    allowMixedAnswer: true,
    options: [
      { id: '4a', title: 'Rahat davranır, kendi akışında kalır', archetype: 'sakin gözlemci', scoreValue: 1 },
      { id: '4b', title: 'Hemen kaynaşır, ilgiyi sever', archetype: 'enerjik kaşif', scoreValue: 2 },
      { id: '4c', title: 'Isınması zaman alır ama sonra açılır', archetype: 'hassas izleyici', scoreValue: 3 },
      { id: '4d', title: 'Çekingen kalır, bana yaslanır', archetype: 'korunmacı', scoreValue: 4 },
    ],
  },
  {
    id: 5,
    text: 'Deniz bir işi başaramadığında (kule devrilir, parça oturmaz) ne yapar?',
    allowMixedAnswer: true,
    options: [
      { id: '5a', title: 'Sakin kalır, tekrar dener', archetype: 'sakin gözlemci', scoreValue: 1 },
      { id: '5b', title: 'Heyecanla yeniden atılır, pes etmez', archetype: 'enerjik kaşif', scoreValue: 2 },
      { id: '5c', title: 'Bozulur ama yardım isteyerek devam eder', archetype: 'hassas izleyici', scoreValue: 3 },
      { id: '5d', title: 'Vazgeçer, oyundan uzaklaşır', archetype: 'korunmacı', scoreValue: 4 },
    ],
  },
]
