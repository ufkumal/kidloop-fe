import { Progress, ProgressLabel, ProgressValue } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface QuestionProgressProps {
  answeredCount: number
  totalQuestions: number
  label?: string
  className?: string
}

export function QuestionProgress({
  answeredCount,
  totalQuestions,
  label = 'Soru ilerlemesi',
  className,
}: QuestionProgressProps) {
  const safeTotal = Math.max(totalQuestions, 0)
  const safeAnswered = Math.min(Math.max(answeredCount, 0), safeTotal || answeredCount)
  const percent = safeTotal > 0 ? Math.round((safeAnswered / safeTotal) * 100) : 0

  return (
    <Progress
      value={percent}
      aria-label={label}
      className={cn('gap-2', className)}
      getAriaValueText={() => `${safeAnswered} / ${safeTotal} soru yanıtlandı`}
    >
      <ProgressLabel className="text-sm font-medium text-foreground">{label}</ProgressLabel>
      <ProgressValue className="font-medium">
        {() => `${safeAnswered} / ${safeTotal}`}
      </ProgressValue>
    </Progress>
  )
}
