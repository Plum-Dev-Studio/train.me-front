import { useState } from 'react'
import { Link, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'
import {
  getPendingSubscriptionCopy,
  subscriptionCheckoutErrorMessage,
} from '@/lib/subscriptionPending'
import {
  getSubscriptionById,
  retrySubscriptionCheckout,
} from '@/lib/subscriptions'

export default function PaymentResultFailurePage() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const paymentId = query.get('payment_id')
  const status = query.get('status')
  const externalReference = query.get('external_reference')
  const subscriptionId = query.get('subscription_id')
  const token = localStorage.getItem('auth_token')
  const [retrying, setRetrying] = useState(false)
  const [retryError, setRetryError] = useState<string | null>(null)

  const subscriptionQuery = useQuery({
    queryKey: ['subscription-status', subscriptionId],
    queryFn: () => getSubscriptionById(subscriptionId!),
    enabled: Boolean(subscriptionId) && Boolean(token),
  })

  const sub = subscriptionQuery.data
  const canRetry = sub?.status === 'pending' && (sub.canRetryPayment ?? false)
  const pendingCopy =
    sub?.status === 'pending'
      ? getPendingSubscriptionCopy(sub.pendingReason, canRetry)
      : null

  async function handleRetry() {
    setRetrying(true)
    setRetryError(null)
    try {
      const result = await retrySubscriptionCheckout()
      window.location.href = result.checkoutUrl
    } catch (err) {
      if (err instanceof ApiError) {
        setRetryError(subscriptionCheckoutErrorMessage(err))
      } else {
        setRetryError('No pudimos iniciar el pago. Intentá nuevamente.')
      }
      setRetrying(false)
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--bg-page)] px-6 py-12">
      <div className="w-full max-w-[560px] rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-8 text-center">
        <h1 className="font-display text-[30px] font-bold text-[var(--text-primary)]">
          Pago rechazado
        </h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
          {pendingCopy?.message ??
            'No pudimos confirmar el pago. Podés intentar nuevamente o revisar otro medio de pago.'}
        </p>
        {paymentId || status || externalReference ? (
          <div className="mt-6 rounded-xl border border-[var(--border-standard)] bg-[var(--bg-page)] px-4 py-3 text-left text-[13px] text-[var(--text-secondary)]">
            {paymentId ? <p>Payment ID: {paymentId}</p> : null}
            {status ? <p>Status: {status}</p> : null}
            {externalReference ? <p>Referencia: {externalReference}</p> : null}
          </div>
        ) : null}
        {sub ? (
          <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
            Estado actual de la suscripción: <strong>{sub.status}</strong>
          </p>
        ) : null}
        <div className="mt-8 flex flex-col items-center gap-3">
          {canRetry && pendingCopy?.ctaLabel ? (
            <button
              type="button"
              disabled={retrying}
              onClick={() => void handleRetry()}
              className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {retrying ? 'Redirigiendo…' : pendingCopy.ctaLabel}
            </button>
          ) : null}
          <Link
            to="/me"
            className="rounded-xl border border-[var(--border-standard)] px-5 py-2.5 text-[14px] font-semibold text-[var(--text-primary)]"
          >
            Ir a mi panel
          </Link>
          <Link
            to="/entrenadores"
            className="text-[14px] text-[var(--text-secondary)] underline"
          >
            Volver a entrenadores
          </Link>
        </div>
        {retryError ? (
          <p
            role="alert"
            className="mt-3 text-[13px] text-[var(--status-expired)]"
          >
            {retryError}
          </p>
        ) : null}
      </div>
    </div>
  )
}
