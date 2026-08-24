import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Nunito, Baloo_2 } from 'next/font/google'
import { AuthProvider } from '@/lib/auth/auth-context'
import { AppBootstrap } from '@/components/auth/app-bootstrap'
import './globals.css'

const _nunito = Nunito({ subsets: ['latin'] })
const _baloo = Baloo_2({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Kidloop — Çocuğuna uygun etkinlik önerileri',
  description:
    'Kidloop, çocuğunun yaşına ve ilgi alanlarına göre kişiselleştirilmiş etkinlik önerileri sunar.',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#faf7f2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" className="bg-background">
      <body className="font-sans antialiased">
        <AuthProvider>
          <AppBootstrap>{children}</AppBootstrap>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
