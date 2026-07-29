import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ACTION_BUTTON_CLASS } from '@/lib/ui'
import { cn } from '@/lib/utils'

interface SubmitButtonProps extends React.ComponentProps<typeof Button> {
  pending?: boolean
  pendingLabel?: string
}

export function SubmitButton({
  pending = false,
  pendingLabel,
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      size="lg"
      className={cn(ACTION_BUTTON_CLASS, className)}
      disabled={disabled || pending}
      {...props}
    >
      {pending ? <Spinner data-icon="inline-start" /> : null}
      {pending ? (pendingLabel ?? children) : children}
    </Button>
  )
}
