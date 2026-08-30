import { useQuery } from '@tanstack/react-query'
import { formatShortDate } from '@/lib/format'
import { planStatusLabel } from '@/lib/plans'
import { fetchTrainerClientPlans } from '@/lib/trainerClients'

interface ClientPlansPanelProps {
  clientId: string
}

function shortId(id: string): string {
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

export function ClientPlansPanel({ clientId }: ClientPlansPanelProps) {
  const query = useQuery({
    queryKey: ['trainerClientPlans', clientId],
    queryFn: () => fetchTrainerClientPlans(clientId),
  })

  if (query.isPending) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Cargando planes…
      </p>
    )
  }

  if (query.isError) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-[13px] text-[var(--status-expired)]">
          No pudimos cargar los planes del cliente.
        </p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          disabled={query.isFetching}
          className="w-fit rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] disabled:opacity-40"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const plans = query.data ?? []

  if (plans.length === 0) {
    return (
      <p className="text-[13px] text-[var(--text-secondary)]">
        Este cliente aún no tiene planes asignados.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-[#E4E4E720] rounded-xl border border-[var(--border-standard)]">
      {plans.map((plan) => (
        <li
          key={plan.id}
          className="grid grid-cols-[minmax(0,1fr)_100px_100px_100px] gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]"
        >
          <span
            className="truncate font-mono text-[12px] text-[var(--text-secondary)]"
            title={plan.id}
          >
            {shortId(plan.id)}
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
        </li>
      ))}
    </ul>
  )
}
