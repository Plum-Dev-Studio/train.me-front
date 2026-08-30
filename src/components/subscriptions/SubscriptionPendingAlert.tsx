import { useState } from 'react'
import { ApiError } from '@/lib/api'
import {
  getPendingSubscriptionCopy,
  subscriptionCheckoutErrorMessage,
  type SubscriptionPendingReason,
} from '@/lib/subscriptionPending'
import { retrySubscriptionCheckout } from '@/lib/subscriptions'

interface SubscriptionPendingAlertProps {
  pendingReason?: SubscriptionPendingReason | null
  canRetryPayment?: boolean
}

export function SubscriptionPendingAlert({
  pendingReason,
  canRetryPayment = false,
}: SubscriptionPendingAlertProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const copy = getPendingSubscriptionCopy(pendingReason, canRetryPayment)

  async function handleRetry() {
    setLoading(true)
    setError(null)
    try {
      const result = await retrySubscriptionCheckout()
      window.location.href = result.checkoutUrl
    } catch (err) {
      if (err instanceof ApiError) {
        setError(subscriptionCheckoutErrorMessage(err))
      } else {
        setError('No pudimos iniciar el pago. Intentá nuevamente.')
      }
      setLoading(false)
    }
  }

  return (
    <div
      role="alert"
      className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-left"
    >
      <p className="text-[14px] text-[var(--text-primary)]">{copy.message}</p>
      {copy.ctaLabel ? (
        <button
          type="button"
          disabled={loading}
          onClick={() => void handleRetry()}
          className="mt-3 rounded-lg bg-[var(--accent-purple)] px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-50"
        >
          {loading ? 'Redirigiendo…' : copy.ctaLabel}
        </button>
      ) : null}
      {error ? (
        <p className="mt-2 text-[13px] text-[var(--status-expired)]">{error}</p>
      ) : null}
    </div>
  )
}
