import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ProfileAvatarProps {
  name: string
  /** Boş bırakılırsa baş harf gösterilir. Fotoğraf yükleme özelliği henüz yok. */
  src?: string | null
  className?: string
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase('tr-TR') ?? '')
    .join('')
}

/**
 * Profil ekranlarındaki tek avatar bileşeni. Görsel alan, ileride
 * fotoğraf yükleme eklenebilecek şekilde ayrı tutulur.
 */
export function ProfileAvatar({ name, src, className }: ProfileAvatarProps) {
  return (
    <Avatar className={cn('size-12 after:border-border', className)}>
      {src ? <AvatarImage src={src} alt="" /> : null}
      <AvatarFallback className="bg-primary-soft font-heading font-bold text-primary">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
