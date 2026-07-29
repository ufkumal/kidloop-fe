import { Button } from '@/components/ui/button'
import { FieldSeparator } from '@/components/ui/field'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M12 11v2.6h6.1c-.25 1.55-1.82 4.55-6.1 4.55A6.15 6.15 0 0 1 12 5.85c1.95 0 3.26.83 4 1.55l1.9-1.83A8.6 8.6 0 0 0 12 3.1a8.9 8.9 0 0 0 0 17.8c5.14 0 8.53-3.61 8.53-8.7 0-.58-.06-1.02-.14-1.45z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M16.1 12.7c0-2.2 1.8-3.3 1.9-3.4-1-1.5-2.6-1.7-3.2-1.7-1.4-.1-2.6.8-3.3.8-.7 0-1.7-.8-2.8-.8-1.5 0-3.5 1.2-3.5 4.3 0 1.9.7 3.9 1.6 5.2.8 1.1 1.5 2 2.5 2 1 0 1.4-.6 2.6-.6 1.2 0 1.5.6 2.6.6s1.8-1 2.5-2c.5-.7.8-1.4 1-1.9-1.9-.7-2.4-2.4-2.4-2.5Zm-2.3-6.4c.6-.7.9-1.6.8-2.6-.9.1-1.9.6-2.5 1.3-.5.6-1 1.6-.8 2.5 1 .1 1.9-.5 2.5-1.2Z"
      />
    </svg>
  )
}

export function SocialAuthButtons() {
  return (
    <div className="flex flex-col gap-4">
      <FieldSeparator>veya</FieldSeparator>
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          aria-describedby="social-auth-hint"
          className="h-11 w-full rounded-xl"
        >
          <GoogleIcon />
          Google ile devam et
        </Button>
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled
          aria-describedby="social-auth-hint"
          className="h-11 w-full rounded-xl"
        >
          <AppleIcon />
          Apple ile devam et
        </Button>
      </div>
      <p id="social-auth-hint" className="text-center text-xs text-muted-foreground">
        Yakında
      </p>
    </div>
  )
}
