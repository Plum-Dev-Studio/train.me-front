import { describe, it, expect } from 'vitest'
import { ApiError } from './api'
import {
  getPendingSubscriptionCopy,
  subscriptionCheckoutErrorMessage,
} from './subscriptionPending'

describe('getPendingSubscriptionCopy', () => {
  it('returns retry copy for rejected payment', () => {
    expect(getPendingSubscriptionCopy('payment_rejected', true)).toEqual({
      message:
        'El último pago fue rechazado. Podés intentar con otro medio de pago.',
      ctaLabel: 'Reintentar pago',
    })
  })

  it('returns wait copy without CTA for payment in progress', () => {
    expect(getPendingSubscriptionCopy('payment_in_progress', false)).toEqual({
      message:
        'Estamos esperando confirmación de Mercado Pago. Suele resolverse en minutos; no hace falta que hagas nada por ahora.',
    })
  })
})

describe('subscriptionCheckoutErrorMessage', () => {
  it('maps active subscription conflict', () => {
    expect(
      subscriptionCheckoutErrorMessage(
        new ApiError(409, {
          error: 'SUBSCRIPTION_ALREADY_ACTIVE',
          message: 'Ya tenés una suscripción activa con este entrenador',
        }),
      ),
    ).toBe('Ya tenés una suscripción activa con este entrenador.')
  })

  it('maps payment in progress conflict', () => {
    expect(
      subscriptionCheckoutErrorMessage(
        new ApiError(409, {
          error: 'PAYMENT_IN_PROGRESS',
          message: 'El pago está en proceso; esperá unos minutos',
        }),
      ),
    ).toBe('El pago está en proceso; esperá unos minutos antes de reintentar.')
  })
})
