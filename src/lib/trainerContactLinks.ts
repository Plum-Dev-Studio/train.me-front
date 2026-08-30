const DEFAULT_WHATSAPP_MESSAGE = 'Hola, te contacto desde train.me.'

export function buildWhatsAppUrl(
  phoneDigits: string,
  prefilledMessage: string = DEFAULT_WHATSAPP_MESSAGE,
): string {
  const params = new URLSearchParams({ text: prefilledMessage })
  return `https://wa.me/${phoneDigits}?${params.toString()}`
}

export function buildInstagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`
}

export function buildMailtoUrl(email: string): string {
  return `mailto:${email}`
}

export function hasTrainerContactChannels(channels: {
  whatsapp?: string | null
  email?: string | null
  instagram?: string | null
}): boolean {
  return Boolean(
    channels.whatsapp?.trim() ||
    channels.email?.trim() ||
    channels.instagram?.trim(),
  )
}
