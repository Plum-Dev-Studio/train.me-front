import { Link, useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getPendingSubscriptionCopy } from '@/lib/subscriptionPending'
import { getSubscriptionById } from '@/lib/subscriptions'

export default function PaymentResultPendingPage() {
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const paymentId = query.get('payment_id')
  const status = query.get('status')
  const externalReference = query.get('external_reference')
  const subscriptionId = query.get('subscription_id')
  const token = localStorage.getItem('auth_token')

  const subscriptionQuery = useQuery({
    queryKey: ['subscription-status', subscriptionId],
    queryFn: () => getSubscriptionById(subscriptionId!),
    enabled: Boolean(subscriptionId) && Boolean(token),
    refetchInterval: 5000,
  })

  const sub = subscriptionQuery.data
  const pendingCopy = sub
    ? getPendingSubscriptionCopy(
        sub.pendingReason,
        sub.canRetryPayment ?? false,
      )
    : null

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--bg-page)] px-6 py-12">
      <div className="w-full max-w-[560px] rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-8 text-center">
        <h1 className="font-display text-[30px] font-bold text-[var(--text-primary)]">
          Pago pendiente
        </h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
          {pendingCopy?.message ??
            'El pago quedó en estado pendiente. Cuando Mercado Pago lo confirme, la suscripción se activará automáticamente.'}
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
          <Link
            to="/me"
            className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
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
      </div>
    </div>
  )
}
