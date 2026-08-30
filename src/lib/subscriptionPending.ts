import type { ApiError } from './api'

export type SubscriptionPendingReason =
  | 'payment_rejected'
  | 'payment_in_progress'
  | 'awaiting_payment'
  | 'unknown'

export interface PendingSubscriptionCopy {
  message: string
  ctaLabel?: string
}

export function getPendingSubscriptionCopy(
  pendingReason: SubscriptionPendingReason | null | undefined,
  canRetryPayment: boolean,
): PendingSubscriptionCopy {
  switch (pendingReason) {
    case 'payment_rejected':
      return {
        message:
          'El último pago fue rechazado. Podés intentar con otro medio de pago.',
        ctaLabel: canRetryPayment ? 'Reintentar pago' : undefined,
      }
    case 'awaiting_payment':
      return {
        message:
          'Tu suscripción está pendiente de pago. Completá el checkout para activarla.',
        ctaLabel: canRetryPayment ? 'Completar pago' : undefined,
      }
    case 'payment_in_progress':
      return {
        message:
          'Estamos esperando confirmación de Mercado Pago. Suele resolverse en minutos; no hace falta que hagas nada por ahora.',
      }
    case 'unknown':
    default:
      return {
        message:
          'Tu suscripción está pendiente. Si el problema persiste, contactá a tu entrenador.',
        ctaLabel: canRetryPayment ? 'Reintentar pago' : undefined,
      }
  }
}

export function subscriptionCheckoutErrorMessage(error: ApiError): string {
  const body = error.body as { message?: string; error?: string } | null
  const apiMessage = body?.message ?? ''
  const code = body?.error

  if (apiMessage.includes('monthly price is not configured')) {
    return 'Este entrenador todavía no configuró su precio mensual.'
  }
  if (apiMessage.includes('MercadoPago account is not connected')) {
    return 'Este entrenador todavía no tiene habilitados los cobros en Mercado Pago.'
  }
  if (error.status === 409) {
    if (code === 'MP_SANDBOX_TOKEN_REQUIRED') {
      return 'Este entrenador tiene Mercado Pago de producción. Hay que reconectar la cuenta en sandbox.'
    }
    if (code === 'SUBSCRIPTION_ALREADY_ACTIVE') {
      return 'Ya tenés una suscripción activa con este entrenador.'
    }
    if (code === 'PAYMENT_IN_PROGRESS') {
      return 'El pago está en proceso; esperá unos minutos antes de reintentar.'
    }
    if (apiMessage.includes('Mercado Pago')) {
      return apiMessage
    }
    return 'Hay que reconectar Mercado Pago de este entrenador.'
  }
  if (error.status === 401 || error.status === 403) {
    return 'Necesitás iniciar sesión como cliente para suscribirte.'
  }
  return `No pudimos iniciar el pago (${error.status}). Intentá nuevamente.`
}
