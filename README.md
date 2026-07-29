# Kidloop – Frontend

Çocuklar için etkinlik önerisi sunan Kidloop platformunun web arayüzü.
Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui ve lucide-react ile geliştirildi.
Tüm arayüz metinleri Türkçedir.

## Kurulum

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışır ve kök adres `/login` ekranına yönlenir.

### `.env.local`

```bash
NEXT_PUBLIC_API_BASE_URL=https://kinloop-be.onrender.com
```

Backend adresi kod içinde sabitlenmez; yalnızca bu değişkenden okunur
(`lib/api/client.ts`). Değişken tanımsızsa istekler aynı origin'e gider.

## Klasör yapısı

```
app/                       Rotalar
  login/                   Giriş (varsayılan ilk ekran)
  register/                Kayıt + "E-postanı doğrula" durumu
  forgot-password/         Demo ekran (backend ucu yok)
  verify-email/            ?token= ile e-posta doğrulama
  onboarding/identity/     Çocuk adı & doğum tarihi (dinamik sorular)
  onboarding/[childId]/questions/   Tek tek soru akışı
  onboarding/[childId]/complete/    Özet + tamamlama
  plan-ready/              Demo günlük plan ekranı
components/
  auth/                    AuthLayout, BrandPanel, AuthCard, SocialAuthButtons, formlar
  onboarding/              OnboardingWelcome, DynamicQuestionRenderer, QuestionProgress, OptionCard
  plan/                    PlanPreviewCard, PlanReadyView
  common/                  ApiErrorAlert, LoadingState, SubmitButton, ComingSoon
  layout/                  AppShell (korumalı sayfa kabuğu)
  ui/                      shadcn/ui bileşenleri
lib/
  api/                     client.ts, auth.ts, onboarding.ts (uç adresleri sadece burada)
  auth/                    localStorage tabanlı oturum + AuthProvider
  onboarding/normalize.ts  API yanıtlarını esnek biçimde normalize eder
  types/                   İstek/yanıt tipleri
  validation/              Form doğrulama kuralları
  mock/sample-activities.ts  Geçici örnek plan verisi
```

## Kullanılan backend uçları

Sözleşmede tanımlı olmayan hiçbir uç çağrılmaz.

| Akış | Uç |
| --- | --- |
| Kayıt | `POST /api/auth/register` |
| Giriş | `POST /api/auth/login` |
| E-posta doğrulama | `GET /api/auth/verify?token=...` |
| Kimlik soruları | `GET /api/onboarding/identity-questions` |
| Güncel anket | `GET /api/children/{childId}/questionnaire/current` |
| Cevap gönderme | `PUT /api/children/{childId}/questionnaire/answers/{questionCode}` |
| Anketi tamamlama | `POST /api/children/{childId}/questionnaire/complete` |

Şifre sıfırlama için backend ucu olmadığından `/forgot-password` yalnızca istemci
tarafı doğrulama yapar ve bilgilendirme mesajı gösterir.

## Kimlik doğrulama

- JWT bu MVP'de `localStorage` içinde tutulur (`kidloop.auth.session`).
- Oturum, istemci tarafında `AuthProvider` ile güvenli biçimde geri yüklenir;
  okuma tamamlanana kadar korumalı sayfalar yönlendirme yapmaz.
- Korumalı sayfalar `ProtectedRoute` ile sarılır; token yoksa `/login`'e gidilir.
- Korumalı isteklere `Authorization: Bearer <token>` başlığı `apiRequest({ auth: true })`
  üzerinden otomatik eklenir.
- `PARENT` dışındaki roller "Bu alan yakında" ekranını görür.

## Onboarding notları

- Soru başlıkları, açıklamaları, tipleri ve seçenekleri **kod içinde tanımlı değildir**;
  hepsi API yanıtından okunur. `lib/onboarding/normalize.ts` alan adı farklılıklarına
  toleranslıdır.
- `DynamicQuestionRenderer` yeni soru tipleri için tek noktadan genişletilebilir.
  Desteklenmeyen tipler tamamlanmış gibi gösterilmez, açıkça bildirilir.
- Her cevaptan sonra yerel anket verisi API yanıtıyla tamamen değiştirilir.
- **V2:** Ebeveynin sistemde kayıtlı çocuğu varsa `identity-questions` çağrılmadan
  onboarding'in uygun adımından devam edilecek. Bu kontrol için ayrılan yer
  `components/onboarding/identity-form.tsx` içindeki veri yükleme `useEffect`'idir;
  yönlendirme ve durum yönetimi bu eklemeyi taşıyacak şekilde ayrılmıştır.

## GitHub akışı

```bash
git init
git add .
git commit -m "Kidloop frontend"
git branch -M main
git remote add origin git@github.com:<kullanici>/<repo>.git
git push -u origin main
```

Özellik geliştirirken `git checkout -b feature/<ad>` ile dal açıp pull request üzerinden
`main`'e birleştirmek önerilir. `.env.local` dosyası `.gitignore` içinde olduğu için
depoya gönderilmez.

## Vercel dağıtımı

1. Vercel'de **New Project** → GitHub deposunu içe aktar.
2. Framework otomatik olarak Next.js algılanır; ek yapılandırma gerekmez.
3. **Settings → Environment Variables** bölümüne `NEXT_PUBLIC_API_BASE_URL` değerini
   Production, Preview ve Development ortamları için ekle.
4. **Deploy**. Sonraki her `main` push'u production, diğer dallar preview dağıtımı üretir.

> `NEXT_PUBLIC_` ön eki derleme zamanında gömülür; değeri değiştirdikten sonra
> yeniden dağıtım gerekir.

## Komutlar

```bash
pnpm dev      # geliştirme sunucusu
pnpm build    # üretim derlemesi
pnpm start    # derlenmiş uygulamayı çalıştır
pnpm lint     # lint kontrolü
```
