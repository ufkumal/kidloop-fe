# Kidloop – Frontend

Çocuklar için etkinlik önerisi sunan Kidloop platformunun web arayüzü.
Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui ve lucide-react ile geliştirildi.
Tüm arayüz metinleri Türkçedir.

## Gereksinimler

- Node.js `20.9.0` veya üzeri
- Corepack (Node.js ile birlikte gelir ve projedeki pnpm sürümünü etkinleştirir)
- Çalışan bir Kidloop backend adresi

Kurulu sürümleri kontrol etmek için:

```bash
node --version
corepack pnpm --version
```

## Hızlı başlangıç

```bash
corepack pnpm install
cp .env.example .env.local
# .env.local içindeki değerleri kendi ortamına göre düzenle
corepack pnpm dev
```

Uygulama `http://localhost:3000` adresinde çalışır ve kök adres `/login` ekranına yönlenir.

> `API_BASE_URL` olmadan giriş, kayıt ve onboarding gibi backend kullanan akışlar
> çalışmaz. Örnek dosyadaki backend'i kullanmayacaksan `corepack pnpm dev` komutundan
> önce `.env.local` içindeki adresi değiştir.

## Ortam değişkenleri

Yerel geliştirmede değişkenler `.env.local` dosyasından okunur. Başlangıç dosyasını
oluşturmak için `cp .env.example .env.local` komutunu kullan. `.env.local` Git tarafından
yok sayılır; anahtarları veya ortama özel değerleri repoya ekleme.

| Değişken | Zorunluluk | Kullanım |
| --- | --- | --- |
| `API_BASE_URL` | Gerekli | Kidloop backend'in kök adresi. Sondaki `/` isteğe bağlıdır. Yalnızca Next.js sunucusu tarafından okunur. |
| `GEMINI_API_KEY` | İsteğe bağlı | Ana sayfadaki sesli geri bildirimi metne dönüştürür. Tanımlı değilse uygulamanın diğer bölümleri çalışır, sesli transkripsiyon `503` döner. |
| `NODE_ENV` | Elle tanımlama | Next.js tarafından yönetilir. Production ortamında Vercel Analytics'i etkinleştirir. |

Örnek `.env.local`:

```dotenv
API_BASE_URL=https://kinloop-be.onrender.com
# Sesli geri bildirim transkripsiyonunu kullanacaksan ekle:
# GEMINI_API_KEY=your_gemini_api_key
```

Değişkenler sunucu tarafında okunur. Bir değeri değiştirdikten sonra geliştirme
sunucusunu yeniden başlat; Vercel'de ise yeni bir deployment oluştur.

Kod, eski kurulumlarla uyumluluk için `NEXT_PUBLIC_API_BASE_URL` değerini yedek olarak
kabul eder. Yeni kurulumlarda bunu kullanma: `NEXT_PUBLIC_` önekli değişkenler istemci
paketine açılabildiği için backend adresi için `API_BASE_URL` tercih edilmelidir.

## Geliştirme sunucusunu başka bir cihazdan açma

Aynı ağdaki başka bir cihazdan, terminalde `Network` satırında gösterilen adresi
(örneğin `http://172.20.10.4:3000`) açabilirsin. `next.config.mjs`, Mac'in güncel
yerel IP adreslerini başlangıçta otomatik olarak izin listesine ekler; Wi-Fi veya
hotspot değişince yalnızca geliştirme sunucusunu yeniden başlatman yeterlidir.

LAN adresinde form düğmesine bastığında URL'ye `?email=...` ekleniyorsa React
istemcisi yüklenmemiş demektir. Şunları kontrol et:

1. `pnpm dev` terminalinde `Blocked cross-origin request` uyarısı var mı?
2. Tarayıcı Console sekmesinde JavaScript yükleme hatası var mı?
3. Network sekmesinde `Fetch/XHR` filtresini kapatıp kırmızı `/_next/` istekleri var mı?
4. IP/ağ değiştiyse `pnpm dev` sürecini durdurup yeniden başlattın mı?

Normal akışta giriş ve kayıt istekleri tarayıcıdan same-origin
`/api/backend/...` adresine `POST` olarak gider; adres çubuğuna parola yazılmaz.

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
  onboarding/[childId]/consents/    İzinler + planı hazırlama
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
| Çocuk oluşturma | `POST /api/children` |
| Güncel anket | `GET /api/children/{childId}/questionnaire/current` |
| Cevap gönderme | `PUT /api/children/{childId}/questionnaire/answers/{questionCode}` |
| Anketi tamamlama | `POST /api/children/{childId}/questionnaire/complete` |
| İzinleri listeleme | `GET /api/consents` |
| İzin tercihi | `PUT /api/consents/{consentId}` |

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
3. **Settings → Environment Variables** bölümüne `API_BASE_URL` değerini
   Production, Preview ve Development ortamları için ekle. Sesli transkripsiyon
   kullanılacaksa `GEMINI_API_KEY` değerini de ekle.
4. **Deploy**. Sonraki her `main` push'u production, diğer dallar preview dağıtımı üretir.

## Komutlar

```bash
corepack pnpm dev      # geliştirme sunucusu
corepack pnpm build    # üretim derlemesi
corepack pnpm start    # üretim derlemesini çalıştır (önce build gerekir)
corepack pnpm lint     # ESLint kontrolü
corepack pnpm test     # Node testlerini çalıştır
```

Üretim modunu yerelde denemek için:

```bash
corepack pnpm build
corepack pnpm start
```
