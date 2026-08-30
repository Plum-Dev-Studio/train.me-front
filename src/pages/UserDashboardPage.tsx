import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { FileDown } from 'lucide-react'
import { ApiError } from '@/lib/api'
import { formatShortDate } from '@/lib/format'
import { getPublicTrainerProfile } from '@/lib/publicTrainers'
import {
  downloadPlanPdf,
  fetchMyPlans,
  fetchPlanSnapshot,
  pickUserFacingPlan,
  type PlanPdfSection,
  type SnapshotRoutineNode,
} from '@/lib/plans'
import { fetchMySubscription } from '@/lib/subscriptions'
import { SubscriptionPendingAlert } from '@/components/subscriptions/SubscriptionPendingAlert'
import {
  WEEKDAY_LABELS,
  routinesForWeekday,
  sortRoutinesByOrder,
  todayMondayIndex,
} from '@/lib/routineWeekday'

const SUB_STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  active: 'Activa',
  canceled: 'Cancelada',
  expired: 'Vencida',
}

type RoutineTab = 'hoy' | 'dia' | 'global'

function RoutineList({ routines }: { routines: SnapshotRoutineNode[] }) {
  if (routines.length === 0) {
    return (
      <p className="text-[14px] text-[var(--text-secondary)]">
        No hay rutina para este día.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {routines.map((routine) => (
        <article
          key={routine.id}
          className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4"
        >
          <h3 className="text-[16px] font-semibold text-[var(--text-primary)]">
            {routine.name}
          </h3>
          {routine.blocks.map((block) => (
            <div key={block.id} className="mt-3">
              <p className="text-[13px] font-medium text-[var(--text-secondary)]">
                {block.name}
                {block.rounds > 1 ? ` · ${block.rounds} rounds` : ''}
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {block.exercises.map((exercise) => (
                  <li
                    key={exercise.id}
                    className="text-[14px] text-[var(--text-primary)]"
                  >
                    Ejercicio {exercise.order + 1} · {exercise.reps} reps
                    {exercise.weight != null ? ` · ${exercise.weight}` : ''}
                    {exercise.notes ? ` — ${exercise.notes}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </article>
      ))}
    </div>
  )
}

export default function UserDashboardPage() {
  const [tab, setTab] = useState<RoutineTab>('hoy')
  const [selectedDay, setSelectedDay] = useState(() => todayMondayIndex())
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [downloading, setDownloading] = useState<PlanPdfSection | null>(null)

  const today = todayMondayIndex()

  const subscriptionQuery = useQuery({
    queryKey: ['subscriptions', 'me'],
    queryFn: fetchMySubscription,
    retry: false,
  })

  const trainerQuery = useQuery({
    queryKey: ['public-trainer', subscriptionQuery.data?.trainerId],
    queryFn: () => getPublicTrainerProfile(subscriptionQuery.data!.trainerId),
    enabled: Boolean(subscriptionQuery.data?.trainerId),
  })

  const plansQuery = useQuery({
    queryKey: ['plans', 'me'],
    queryFn: fetchMyPlans,
    enabled: subscriptionQuery.isSuccess,
  })

  const plan = useMemo(
    () => pickUserFacingPlan(plansQuery.data ?? []),
    [plansQuery.data],
  )

  const snapshotQuery = useQuery({
    queryKey: ['plan-snapshot', plan?.id],
    queryFn: () => fetchPlanSnapshot(plan!.id),
    enabled: Boolean(plan?.id),
    retry: false,
  })

  async function handleDownload(section: PlanPdfSection) {
    if (!plan) return
    setPdfError(null)
    setDownloading(section)
    try {
      await downloadPlanPdf(plan.id, section)
    } catch (err) {
      setPdfError(
        err instanceof ApiError
          ? `No se pudo descargar el PDF (${err.status}).`
          : 'No se pudo descargar el PDF. Intentá de nuevo.',
      )
    } finally {
      setDownloading(null)
    }
  }

  if (subscriptionQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 text-[14px] text-[var(--text-secondary)]">
        Cargando tu panel…
      </div>
    )
  }

  if (
    subscriptionQuery.isError &&
    subscriptionQuery.error instanceof ApiError &&
    subscriptionQuery.error.status === 404
  ) {
    return (
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-6 py-10">
        <h1 className="font-display text-[34px] font-bold text-[var(--text-primary)]">
          Tu panel
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Todavía no tenés una suscripción.
        </p>
        <Link
          to="/entrenadores"
          className="w-fit rounded-xl bg-[var(--accent-purple)] px-4 py-2 text-[14px] font-semibold text-white"
        >
          Ver entrenadores
        </Link>
      </div>
    )
  }

  if (subscriptionQuery.isError || !subscriptionQuery.data) {
    return (
      <div className="mx-auto w-full max-w-[1100px] px-6 py-10 text-[14px] text-[var(--text-secondary)]">
        No pudimos cargar tu suscripción. Intentá de nuevo.
      </div>
    )
  }

  const sub = subscriptionQuery.data
  const routines = snapshotQuery.data?.payload.routines ?? []
  const nutrition = snapshotQuery.data?.payload.nutrition ?? null
  const snapshotMissing =
    snapshotQuery.isError &&
    snapshotQuery.error instanceof ApiError &&
    snapshotQuery.error.status === 404
  const planLoading =
    plansQuery.isPending || (Boolean(plan) && snapshotQuery.isPending)
  const noPlan =
    !planLoading &&
    (!plan || snapshotMissing || (Boolean(plan) && snapshotQuery.isError))

  const visibleRoutines =
    tab === 'global'
      ? sortRoutinesByOrder(routines)
      : routinesForWeekday(routines, tab === 'hoy' ? today : selectedDay)

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-[34px] font-bold text-[var(--text-primary)]">
          Tu panel
        </h1>
        <p className="text-[15px] text-[var(--text-secondary)]">
          Suscripción, rutina de hoy y descargas de tu plan.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-5">
        <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
          Suscripción
        </h2>
        <dl className="mt-3 grid gap-2 text-[14px] md:grid-cols-2">
          <div>
            <dt className="text-[var(--text-secondary)]">Entrenador</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {trainerQuery.data?.displayName ??
                (trainerQuery.isError ? 'Entrenador' : 'Cargando…')}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Estado</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {SUB_STATUS_LABEL[sub.status] ?? sub.status}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Plan</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {sub.planType === 'monthly' ? 'Mensual' : 'Anual'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Inicio</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {formatShortDate(sub.startDate)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--text-secondary)]">Vence</dt>
            <dd className="font-medium text-[var(--text-primary)]">
              {formatShortDate(sub.endDate)}
            </dd>
          </div>
        </dl>
        {sub.status === 'pending' ? (
          <SubscriptionPendingAlert
            pendingReason={sub.pendingReason}
            canRetryPayment={sub.canRetryPayment ?? false}
          />
        ) : null}
      </section>

      {planLoading ? (
        <p className="text-[14px] text-[var(--text-secondary)]">
          Cargando tu plan…
        </p>
      ) : noPlan ? (
        <p className="text-[15px] text-[var(--text-secondary)]">
          Tu entrenador todavía no asignó un plan.
        </p>
      ) : (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['hoy', 'Hoy'],
                  ['dia', 'Día'],
                  ['global', 'Global'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`rounded-lg px-3 py-2 text-[14px] font-medium ${
                    tab === id
                      ? 'bg-[var(--accent-purple)] text-white'
                      : 'border border-[var(--border-standard)] text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'dia' ? (
              <div className="flex flex-wrap gap-2">
                {WEEKDAY_LABELS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setSelectedDay(index)}
                    className={`rounded-lg px-3 py-1.5 text-[13px] ${
                      selectedDay === index
                        ? 'bg-[var(--bg-card)] font-semibold text-[var(--text-primary)] ring-1 ring-[var(--accent-purple)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : null}

            <RoutineList routines={visibleRoutines} />
          </section>

          <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-5">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Nutrición
            </h2>
            {nutrition ? (
              <p className="mt-2 text-[14px] text-[var(--text-primary)]">
                {nutrition.dailyCaloriesKcal != null
                  ? `${nutrition.dailyCaloriesKcal} kcal/día`
                  : 'Plan nutricional'}
                {[
                  nutrition.proteinG != null && `P: ${nutrition.proteinG}g`,
                  nutrition.carbsG != null && `C: ${nutrition.carbsG}g`,
                  nutrition.fatG != null && `F: ${nutrition.fatG}g`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            ) : (
              <p className="mt-2 text-[14px] text-[var(--text-secondary)]">
                Todavía no hay guía de nutrición en tu plan.
              </p>
            )}
            {nutrition?.notes ? (
              <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                {nutrition.notes}
              </p>
            ) : null}
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
              Descargar PDF
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                disabled={downloading !== null}
                onClick={() => void handleDownload('exercises')}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-standard)] px-4 py-2 text-[14px] font-semibold text-[var(--text-primary)] disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                Ejercicios
              </button>
              <button
                type="button"
                disabled={downloading !== null}
                onClick={() => void handleDownload('nutrition')}
                className="flex items-center gap-2 rounded-xl border border-[var(--border-standard)] px-4 py-2 text-[14px] font-semibold text-[var(--text-primary)] disabled:opacity-50"
              >
                <FileDown className="h-4 w-4" />
                Nutrición
              </button>
            </div>
            {pdfError ? (
              <p className="text-[13px] text-[var(--status-expired)]">
                {pdfError}
              </p>
            ) : null}
          </section>
        </>
      )}
    </div>
  )
}
