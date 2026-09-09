import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { formatShortDate } from '@/lib/format'
import { fetchTrainerClientsWithUsers } from '@/lib/trainerClients'
import { mapTrainerClientStatus } from '@/lib/trainerDashboard'
import { ClientIntakePanel } from '@/components/ClientIntakePanel'
import { ClientTrainerNotesPanel } from '@/components/ClientTrainerNotesPanel'
import { ClientPlansPanel } from '@/components/ClientPlansPanel'

function shortId(id: string | null): string {
  if (!id) return '—'
  return id.length > 10 ? `${id.slice(0, 8)}…` : id
}

const GRID_COLS = 'grid-cols-[minmax(0,1.4fr)_100px_120px_140px_100px]'

export default function ClientsPage() {
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId
  const [page, setPage] = useState(1)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const limit = 20

  const query = useQuery({
    queryKey: ['trainerClients', trainerProfileId, page, limit],
    queryFn: () => fetchTrainerClientsWithUsers(page, limit),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.list.total / query.data.list.limit))
    : 1

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Clientes"
        description="Personas vinculadas a tu perfil de entrenador"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-8">
        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando clientes…
          </p>
        ) : query.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar la lista
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
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[13px] text-[var(--text-secondary)]">
                {query.data.list.total === 0
                  ? 'Sin clientes por ahora'
                  : `${query.data.list.total} cliente${query.data.list.total === 1 ? '' : 's'} · página ${page} de ${totalPages}`}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || query.isFetching}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] disabled:opacity-40"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages || query.isFetching}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[var(--border-standard)] px-3 py-1.5 text-[13px] font-medium text-[var(--text-primary)] disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </div>

            {query.data.list.data.length === 0 ? (
              <p className="text-[14px] text-[var(--text-secondary)]">
                Cuando agregues clientes, aparecerán acá.
              </p>
            ) : (
              <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
                <div
                  className={`grid ${GRID_COLS} gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]`}
                >
                  <span>Email</span>
                  <span>Estado</span>
                  <span>Suscripción</span>
                  <span>Actualizado</span>
                  <span>ID cliente</span>
                </div>
                <ul className="flex-1 overflow-auto divide-y divide-[#E4E4E720]">
                  {query.data.list.data.map((row) => {
                    const user = query.data!.usersById[row.userId]
                    const { label: statusLabel } = mapTrainerClientStatus(
                      row.status,
                    )
                    return (
                      <li
                        key={row.id}
                        className={`grid ${GRID_COLS} gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]`}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedClientId((current) =>
                              current === row.id ? null : row.id,
                            )
                          }
                          className="truncate text-left font-medium hover:underline"
                        >
                          {user?.email ?? row.userId}
                        </button>
                        <span className="text-[var(--text-secondary)]">
                          {statusLabel}
                        </span>
                        <span
                          className="truncate font-mono text-[12px] text-[var(--text-secondary)]"
                          title={row.activeSubscriptionId ?? undefined}
                        >
                          {shortId(row.activeSubscriptionId)}
                        </span>
                        <span className="text-[var(--text-secondary)]">
                          {formatShortDate(row.updatedAt)}
                        </span>
                        <span
                          className="truncate font-mono text-[11px] text-[var(--text-tertiary)]"
                          title={row.id}
                        >
                          {shortId(row.id)}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}

            {selectedClientId ? (
              <>
                <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    Notas del entrenador
                  </h2>
                  <div className="mt-3">
                    <ClientTrainerNotesPanel
                      clientId={selectedClientId}
                      initialNotes={
                        query.data.list.data.find(
                          (r) => r.id === selectedClientId,
                        )?.trainerNotes ?? null
                      }
                      trainerProfileId={trainerProfileId}
                    />
                  </div>
                </section>

                <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    Planes del cliente
                  </h2>
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    Borradores y publicados vinculados a este alumno.
                  </p>
                  <div className="mt-3">
                    <ClientPlansPanel clientId={selectedClientId} />
                  </div>
                </section>

                <section className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-6">
                  <h2 className="text-[18px] font-semibold text-[var(--text-primary)]">
                    Cuestionario del alumno
                  </h2>
                  <div className="mt-3">
                    <ClientIntakePanel clientId={selectedClientId} />
                  </div>
                </section>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
