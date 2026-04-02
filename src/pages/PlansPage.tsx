import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { fetchPlansWithUserEmails, planStatusLabel } from '@/lib/plans'

function formatShortDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

export default function PlansPage() {
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId

  const query = useQuery({
    queryKey: ['plans', 'trainer', trainerProfileId],
    queryFn: () => fetchPlansWithUserEmails(trainerProfileId!),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  if (dashboard.isPending) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Planes de Entrenamiento" />
        <p className="p-8 text-[14px] text-[var(--text-secondary)]">
          Cargando…
        </p>
      </div>
    )
  }

  if (dashboard.isError || !trainerProfileId) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Planes de Entrenamiento" />
        <div className="flex flex-col gap-3 p-8">
          <p className="text-[14px] text-[var(--text-secondary)]">
            Necesitamos tu perfil de entrenador para listar planes. Volvé al
            panel e intentá de nuevo.
          </p>
          <button
            type="button"
            onClick={() => void dashboard.refetch()}
            className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Planes de Entrenamiento"
        description="Planes asignados a tus clientes"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-8">
        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando planes…
          </p>
        ) : query.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar los planes
              {query.error?.message ? ` (${query.error.message})` : ''}.
            </p>
            <button
              type="button"
              onClick={() => void query.refetch()}
              disabled={query.isFetching}
              className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Reintentar
            </button>
          </div>
        ) : query.data ? (
          query.data.plans.length === 0 ? (
            <p className="text-[14px] text-[var(--text-secondary)]">
              Todavía no tenés planes asignados.
            </p>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_100px_100px_100px] gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]">
                <span>Cliente</span>
                <span>Notas</span>
                <span>Estado</span>
                <span>Inicio</span>
                <span>Fin</span>
                <span>Actualizado</span>
              </div>
              <ul className="divide-y divide-[#E4E4E720]">
                {query.data.plans.map((plan) => {
                  const user = query.data!.usersById[plan.userId]
                  return (
                    <li
                      key={plan.id}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_100px_100px_100px] gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]"
                    >
                      <span className="truncate font-medium">
                        {user?.email ?? plan.userId}
                      </span>
                      <span className="line-clamp-2 text-[var(--text-secondary)]">
                        {plan.notes ?? '—'}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {planStatusLabel(plan.status)}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {formatShortDate(plan.startDate)}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {formatShortDate(plan.endDate)}
                      </span>
                      <span className="text-[var(--text-secondary)]">
                        {formatShortDate(plan.updatedAt)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
