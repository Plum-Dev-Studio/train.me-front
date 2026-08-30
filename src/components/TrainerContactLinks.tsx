import {
  buildInstagramUrl,
  buildMailtoUrl,
  buildWhatsAppUrl,
  hasTrainerContactChannels,
} from '@/lib/trainerContactLinks'

export interface TrainerContactLinksProps {
  whatsapp?: string | null
  email?: string | null
  instagram?: string | null
  variant?: 'inline' | 'stack'
}

export function TrainerContactLinks({
  whatsapp,
  email,
  instagram,
  variant = 'stack',
}: TrainerContactLinksProps) {
  if (!hasTrainerContactChannels({ whatsapp, email, instagram })) {
    return null
  }

  const containerClass =
    variant === 'inline'
      ? 'flex flex-wrap gap-3'
      : 'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3'

  const linkClass =
    'inline-flex items-center rounded-lg border border-[var(--border-standard)] px-3 py-2 text-[14px] font-medium text-[var(--accent-purple)] hover:bg-[var(--bg-page)]'

  return (
    <div className={containerClass}>
      {whatsapp ? (
        <a
          href={buildWhatsAppUrl(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          WhatsApp
        </a>
      ) : null}
      {email ? (
        <a href={buildMailtoUrl(email)} className={linkClass}>
          Email
        </a>
      ) : null}
      {instagram ? (
        <a
          href={buildInstagramUrl(instagram)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClass}
        >
          Instagram
        </a>
      ) : null}
    </div>
  )
}
