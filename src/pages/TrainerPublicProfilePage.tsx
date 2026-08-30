import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { ApiError } from '@/lib/api'
import { getPublicTrainerProfile } from '@/lib/publicTrainers'
import { createSubscriptionCheckout } from '@/lib/subscriptions'
import { subscriptionCheckoutErrorMessage } from '@/lib/subscriptionPending'
import { fetchCurrentUser } from '@/lib/users'
import { TrainerContactLinks } from '@/components/TrainerContactLinks'
import { TrainerReviewStars } from '@/components/TrainerReviewStars'
import { TrainerReviewsSection } from '@/components/TrainerReviewsSection'

function formatPrice(price: number | null): string {
  if (price === null) return 'Precio a coordinar'
  return `$${price.toLocaleString('es-AR')}/mes`
}

export default function TrainerPublicProfilePage() {
  const { trainerId = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const hasAuthToken = Boolean(localStorage.getItem('auth_token'))

  const query = useQuery({
    queryKey: ['public-trainer', trainerId],
    queryFn: () => getPublicTrainerProfile(trainerId),
    enabled: Boolean(trainerId),
  })

  const currentUserQuery = useQuery({
    queryKey: ['auth-me'],
    queryFn: fetchCurrentUser,
    enabled: hasAuthToken,
    retry: false,
  })

  const canReview = currentUserQuery.data?.role === 'user'

  async function handleSubscribe() {
    const token = localStorage.getItem('auth_token')
    if (!token) {
      localStorage.setItem(
        'post_login_redirect',
        `${location.pathname}${location.search}`,
      )
      navigate('/login', { replace: true })
      return
    }

    setSubscribing(true)
    setError(null)
    try {
      const result = await createSubscriptionCheckout({
        trainerId,
        planType: 'monthly',
      })
      window.location.href = result.checkoutUrl
    } catch (err) {
      if (err instanceof ApiError) {
        setError(subscriptionCheckoutErrorMessage(err))
      } else {
        setError('No pudimos iniciar la suscripción. Intentá nuevamente.')
      }
      setSubscribing(false)
    }
  }

  if (query.isPending) {
    return <p className="mx-auto max-w-[1100px] px-6 py-10">Cargando perfil…</p>
  }

  if (query.isError || !query.data) {
    return (
      <div className="mx-auto flex max-w-[1100px] flex-col gap-3 px-6 py-10">
        <p>No pudimos cargar el perfil.</p>
        <Link to="/entrenadores" className="underline">
          Volver a entrenadores
        </Link>
      </div>
    )
  }

  const trainer = query.data
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      <Link
        to="/entrenadores"
        className="text-[14px] text-[var(--text-secondary)]"
      >
        ← Volver a entrenadores
      </Link>

      <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[34px] font-bold text-[var(--text-primary)]">
              {trainer.displayName}
            </h1>
            <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
              {trainer.experienceYears !== null
                ? `${trainer.experienceYears} años de experiencia`
                : 'Experiencia no informada'}
            </p>
            <div className="mt-2">
              <TrainerReviewStars
                averageRating={trainer.averageRating}
                reviewCount={trainer.reviewCount}
              />
            </div>
          </div>
          <div className="rounded-xl bg-[var(--accent-purple)] px-4 py-2 text-[14px] font-semibold text-white">
            {formatPrice(trainer.monthlyPrice)}
          </div>
        </div>

        <p className="mt-6 whitespace-pre-wrap text-[15px] text-[var(--text-secondary)]">
          {trainer.bio ?? 'Este entrenador aún no completó su descripción.'}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {trainer.specialties.length > 0 ? (
            trainer.specialties.map((name) => (
              <span
                key={name}
                className="rounded-full border border-[var(--border-standard)] px-3 py-1 text-[13px] text-[var(--text-secondary)]"
              >
                {name}
              </span>
            ))
          ) : (
            <span className="text-[13px] text-[var(--text-secondary)]">
              Sin especialidades cargadas
            </span>
          )}
        </div>

        <TrainerContactLinks
          whatsapp={trainer.contactWhatsapp}
          email={trainer.contactEmail}
          instagram={trainer.contactInstagram}
          variant="inline"
        />

        <div className="mt-8">
          <button
            type="button"
            disabled={subscribing || trainer.monthlyPrice === null}
            onClick={() => void handleSubscribe()}
            className="rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {subscribing ? 'Redirigiendo al checkout…' : 'Suscribirme'}
          </button>
          {trainer.monthlyPrice === null ? (
            <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
              Suscripción no disponible: este entrenador aún no configuró un
              precio mensual.
            </p>
          ) : null}
          {error ? (
            <p
              role="alert"
              className="mt-2 text-[13px] text-[var(--status-expired)]"
            >
              {error}
            </p>
          ) : null}
        </div>
      </section>

      <TrainerReviewsSection
        trainerId={trainer.id}
        summary={{
          averageRating: trainer.averageRating,
          reviewCount: trainer.reviewCount,
        }}
        canReview={canReview}
      />
    </div>
  )
}
