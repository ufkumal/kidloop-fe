/**
 * GEÇİCİ ÖRNEK VERİ.
 * Kişiselleştirilmiş plan ucu hazır olduğunda bu dosya tamamen kaldırılıp
 * yerine gerçek API çağrısı konulacak. Başka hiçbir yerde plan verisi tutulmaz.
 */

export type ActivityTone = 'primary' | 'orange' | 'purple'

export interface SampleActivity {
  id: string
  title: string
  description: string
  duration: string
  place: string
  skill: string
  tone: ActivityTone
}

export const SAMPLE_ACTIVITIES: SampleActivity[] = [
  {
    id: 'renk-avi',
    title: 'Evde renk avı',
    description:
      'Evin içinde belirlediğin üç rengi birlikte arayın. Bulduğunuz nesneleri masada küçük bir koleksiyona dönüştürün.',
    duration: '15 dakika',
    place: 'Ev içi',
    skill: 'Dikkat & eşleştirme',
    tone: 'primary',
  },
  {
    id: 'hikaye-kutusu',
    title: 'Hikâye kutusu',
    description:
      'Bir kutuya üç oyuncak koyun. Sırayla birer cümle ekleyerek hep birlikte kısa bir hikâye kurun.',
    duration: '20 dakika',
    place: 'Ev içi',
    skill: 'Dil & hayal gücü',
    tone: 'orange',
  },
  {
    id: 'parkta-denge',
    title: 'Parkta denge parkuru',
    description:
      'Parktaki bordür, basamak ve çizgileri kullanarak küçük bir denge parkuru oluştur. Her turda bir hareket ekleyin.',
    duration: '30 dakika',
    place: 'Açık hava',
    skill: 'Kaba motor',
    tone: 'purple',
  },
]
