import { describe, it, expect } from 'vitest'
import {
  buildInstagramUrl,
  buildMailtoUrl,
  buildWhatsAppUrl,
  hasTrainerContactChannels,
} from './trainerContactLinks'

describe('trainerContactLinks', () => {
  it('buildWhatsAppUrl encodes prefilled message', () => {
    expect(buildWhatsAppUrl('5491123456789')).toBe(
      'https://wa.me/5491123456789?text=Hola%2C+te+contacto+desde+train.me.',
    )
  })

  it('buildWhatsAppUrl accepts custom message', () => {
    expect(buildWhatsAppUrl('54911', 'Hola coach')).toBe(
      'https://wa.me/54911?text=Hola+coach',
    )
  })

  it('buildInstagramUrl strips leading @ if passed by mistake', () => {
    expect(buildInstagramUrl('coach.fit')).toBe(
      'https://instagram.com/coach.fit',
    )
  })

  it('buildMailtoUrl returns mailto link', () => {
    expect(buildMailtoUrl('coach@example.com')).toBe('mailto:coach@example.com')
  })

  it('hasTrainerContactChannels is false when all empty', () => {
    expect(
      hasTrainerContactChannels({
        whatsapp: null,
        email: '',
        instagram: '  ',
      }),
    ).toBe(false)
  })

  it('hasTrainerContactChannels is true when any channel set', () => {
    expect(hasTrainerContactChannels({ whatsapp: '54911' })).toBe(true)
  })
})
