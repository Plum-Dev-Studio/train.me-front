import { Link } from 'react-router'
import { useLocation } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { getSubscriptionById } from '@/lib/subscriptions'

export default function PaymentResultFailurePage() {
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
  })

  return (
    <div className="flex min-h-full items-center justify-center bg-[var(--bg-page)] px-6 py-12">
      <div className="w-full max-w-[560px] rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-8 text-center">
        <h1 className="font-display text-[30px] font-bold text-[var(--text-primary)]">
          Pago rechazado
        </h1>
        <p className="mt-3 text-[15px] text-[var(--text-secondary)]">
          No pudimos confirmar el pago. Podés intentar nuevamente o revisar otro
          medio de pago.
        </p>
        {paymentId || status || externalReference ? (
          <div className="mt-6 rounded-xl border border-[var(--border-standard)] bg-[var(--bg-page)] px-4 py-3 text-left text-[13px] text-[var(--text-secondary)]">
            {paymentId ? <p>Payment ID: {paymentId}</p> : null}
            {status ? <p>Status: {status}</p> : null}
            {externalReference ? <p>Referencia: {externalReference}</p> : null}
          </div>
        ) : null}
        {subscriptionQuery.data ? (
          <p className="mt-3 text-[13px] text-[var(--text-secondary)]">
            Estado actual de la suscripción:{' '}
            <strong>{subscriptionQuery.data.status}</strong>
          </p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <Link
            to="/entrenadores"
            className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
          >
            Volver a entrenadores
          </Link>
        </div>
      </div>
    </div>
  )
}
