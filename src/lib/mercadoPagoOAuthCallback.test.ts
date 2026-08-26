import { describe, it, expect } from 'vitest'
import { getMercadoPagoOAuthCallbackMessage } from './mercadoPagoOAuthCallback'

describe('getMercadoPagoOAuthCallbackMessage', () => {
  it('returns success message', () => {
    expect(getMercadoPagoOAuthCallbackMessage('success', null)).toBe(
      'Mercado Pago conectado correctamente.',
    )
  })

  it('maps known error reasons', () => {
    expect(
      getMercadoPagoOAuthCallbackMessage('error', 'MP_AUTH_DENIED'),
    ).toContain('rechazaste')
    expect(
      getMercadoPagoOAuthCallbackMessage('error', 'MP_STATE_EXPIRED'),
    ).toContain('expiró')
  })

  it('returns generic error for unknown reason', () => {
    expect(
      getMercadoPagoOAuthCallbackMessage('error', 'unknown_error'),
    ).toContain('No pudimos conectar')
  })

  it('returns null for unrelated status', () => {
    expect(getMercadoPagoOAuthCallbackMessage('pending', null)).toBeNull()
  })
})
