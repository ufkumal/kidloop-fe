'use client'

import Link from 'next/link'
import { MessageCircleQuestion, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty'
import type { OnboardingAnswer } from '@/lib/types/profile'

interface OnboardingAnswersCardProps {
  answers: OnboardingAnswer[]
  childName: string
  /** Onboarding'e dönmek için mevcut soru adımının bağlantısı. */
  questionsHref: string
}

/**
 * Onboarding soru-cevap özeti. Form değil, okunabilir bir liste olarak
 * gösterilir; düzenleme mevcut onboarding akışına yönlendirir.
 */
export function OnboardingAnswersCard({
  answers,
  childName,
  questionsHref,
}: OnboardingAnswersCardProps) {
  return (
    <Card className="rounded-3xl shadow-soft ring-border [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]">
      <CardHeader className="gap-1.5">
        <CardTitle className="font-heading text-lg font-bold">Tanıma soruları</CardTitle>
        <CardDescription className="leading-relaxed">
          {childName} için onboarding sırasında paylaştığın yanıtlar.
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-5">
        {answers.length === 0 ? (
          <Empty className="border border-dashed border-input bg-warm/40">
            <EmptyHeader>
              <EmptyTitle className="font-heading text-base font-bold">
                Henüz yanıt yok
              </EmptyTitle>
              <EmptyDescription>
                {childName} için tanıma sorularını yanıtladığında öneriler daha isabetli olur.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                variant="secondary"
                size="sm"
                className="h-11 rounded-xl px-4"
                nativeButton={false}
                render={<Link href={questionsHref} />}
              >
                Soruları yanıtla
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <dl className="flex flex-col gap-3">
            {answers.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-1.5 rounded-2xl bg-warm/50 px-4 py-3.5 sm:flex-row sm:gap-6"
              >
                <dt className="flex min-w-0 items-start gap-2 text-sm leading-relaxed text-muted-foreground sm:w-1/2">
                  <MessageCircleQuestion
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <span className="text-pretty break-words">{item.question}</span>
                </dt>
                <dd className="min-w-0 text-pretty text-sm font-semibold leading-relaxed break-words text-foreground sm:w-1/2">
                  {item.answer ?? (
                    <span className="font-normal text-muted-foreground">Yanıtlanmadı</span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {answers.length > 0 ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Yanıtlar değiştikçe etkinlik önerileri de güncellenir.
            </p>
            {/* TODO(entegrasyon): yanıt düzenleme ucu hazır olduğunda buraya bağlanacak. */}
            <Button
              variant="secondary"
              size="sm"
              className="h-11 shrink-0 rounded-xl px-4"
              nativeButton={false}
              render={<Link href={questionsHref} />}
            >
              <Pencil data-icon="inline-start" />
              Yanıtları düzenle
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
