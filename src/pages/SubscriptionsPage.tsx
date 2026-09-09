import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { formatShortDate } from '@/lib/format'
import { listTrainerSubscriptions } from '@/lib/subscriptions'
import { fetchUser } from '@/lib/users'

const statusLabel: Record<string, string> = {
  pending: 'Pendiente',
  active: 'Activa',
  canceled: 'Cancelada',
  expired: 'Vencida',
}

export default function SubscriptionsPage() {
  const query = useQuery({
    queryKey: ['trainerSubscriptions', 1, 50],
    queryFn: async () => {
      const list = await listTrainerSubscriptions(1, 50)
      const userIds = [...new Set(list.data.map((s) => s.userId))]
      const users = await Promise.all(userIds.map((id) => fetchUser(id)))
      const usersById = Object.fromEntries(
        userIds.map((id, i) => [id, users[i]!]),
      )
      return { list, usersById }
    },
  })

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Suscripciones"
        description="Seguimiento de estado de suscripciones de tus clientes"
      />
      <div className="flex flex-1 flex-col gap-4 overflow-auto p-8">
        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando suscripciones…
          </p>
        ) : query.isError ? (
          <p className="text-[14px] text-[var(--status-expired)]">
            No pudimos cargar suscripciones.
          </p>
        ) : query.data.list.data.length === 0 ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Todavía no tenés suscripciones.
          </p>
        ) : (
          <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
            <div className="grid grid-cols-[minmax(0,1fr)_120px_120px_120px_120px] gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]">
              <span>Cliente</span>
              <span>Plan</span>
              <span>Estado</span>
              <span>Inicio</span>
              <span>Fin</span>
            </div>
            <ul className="flex-1 overflow-auto divide-y divide-[#E4E4E720]">
              {query.data.list.data.map((subscription) => {
                const user = query.data.usersById[subscription.userId]
                return (
                  <li
                    key={subscription.id}
                    className="grid grid-cols-[minmax(0,1fr)_120px_120px_120px_120px] gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]"
                  >
                    <span className="truncate">
                      {user?.email ?? subscription.userId}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {subscription.planType === 'monthly'
                        ? 'Mensual'
                        : 'Anual'}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {statusLabel[subscription.status] ?? subscription.status}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {formatShortDate(subscription.startDate)}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {formatShortDate(subscription.endDate)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
