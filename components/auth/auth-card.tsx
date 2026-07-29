import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AuthCardProps {
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({ title, description, children, footer, className }: AuthCardProps) {
  return (
    <Card
      className={cn(
        'rounded-3xl shadow-card ring-border [--card-spacing:--spacing(6)] sm:[--card-spacing:--spacing(8)]',
        className,
      )}
    >
      <CardHeader className="gap-2">
        <CardTitle className="font-heading text-2xl font-bold">{title}</CardTitle>
        {description ? (
          <CardDescription className="text-pretty leading-relaxed">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {children}
        {footer ? <div className="text-center text-sm text-muted-foreground">{footer}</div> : null}
      </CardContent>
    </Card>
  )
}
