import { BrandPanel } from '@/components/auth/brand-panel'
import { KidloopLogo } from '@/components/brand/kidloop-logo'

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <main className="flex flex-col items-center justify-center gap-8 px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md lg:hidden">
          <KidloopLogo />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
