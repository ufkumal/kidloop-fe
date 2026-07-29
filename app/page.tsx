import { redirect } from 'next/navigation'

/** Uygulamanın ilk ekranı giriş sayfasıdır. */
export default function HomePage() {
  redirect('/login')
}
