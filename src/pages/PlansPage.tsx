import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { FileDown } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { ApiError } from '@/lib/api'
import { formatShortDate } from '@/lib/format'
import {
  downloadPlanPdf,
  fetchPlansWithUserEmails,
  planStatusLabel,
} from '@/lib/plans'

const GRID_COLS =
  'grid-cols-[minmax(0,1fr)_minmax(0,1fr)_100px_100px_100px_100px_52px]'

export default function PlansPage() {
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId

  const query = useQuery({
    queryKey: ['plans', 'trainer', trainerProfileId],
    queryFn: () => fetchPlansWithUserEmails(trainerProfileId!),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  const [downloadingPlanId, setDownloadingPlanId] = useState<string | null>(
    null,
  )
  const [pdfErrors, setPdfErrors] = useState<Record<string, string>>({})

  async function handleDownloadPdf(planId: string) {
    setPdfErrors((prev) => {
      const next = { ...prev }
      delete next[planId]
      return next
    })
    setDownloadingPlanId(planId)
    try {
      await downloadPlanPdf(planId)
    } catch (err) {
      if (err instanceof ApiError) {
        setPdfErrors((prev) => ({
          ...prev,
          [planId]:
            `No se pudo descargar el PDF (${err.status}). ${err.status === 403 ? 'Sin permiso.' : err.status === 404 ? 'Plan no encontrado.' : ''}`.trim(),
        }))
      } else {
        setPdfErrors((prev) => ({
          ...prev,
          [planId]: 'No se pudo descargar el PDF. Intentá de nuevo.',
        }))
      }
    } finally {
      setDownloadingPlanId(null)
    }
  }

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
        <Link
          to="/app/plantillas"
          className="w-fit text-[14px] font-semibold text-[var(--accent-purple)] hover:opacity-80"
        >
          Armar o asignar una plantilla
        </Link>
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
            <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
              <div
                className={`grid ${GRID_COLS} gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]`}
              >
                <span>Cliente</span>
                <span>Notas</span>
                <span>Estado</span>
                <span>Inicio</span>
                <span>Fin</span>
                <span>Actualizado</span>
                <span className="text-center">PDF</span>
              </div>
              <ul className="flex-1 overflow-auto divide-y divide-[#E4E4E720]">
                {query.data.plans.map((plan) => {
                  const user = query.data!.usersById[plan.userId]
                  const clientLabel = user?.email ?? plan.userId
                  const busy = downloadingPlanId === plan.id
                  return (
                    <li
                      key={plan.id}
                      className={`grid ${GRID_COLS} gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]`}
                    >
                      <span className="truncate font-medium">
                        {clientLabel}
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
                      <div className="flex flex-col items-center gap-1">
                        <button
                          type="button"
                          disabled={busy}
                          aria-label={`Descargar PDF del plan para ${clientLabel}`}
                          onClick={() => void handleDownloadPdf(plan.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[#E4E4E720] hover:text-[var(--text-primary)] disabled:opacity-40"
                        >
                          <FileDown className="h-4 w-4 shrink-0" aria-hidden />
                        </button>
                        {pdfErrors[plan.id] ? (
                          <p
                            role="alert"
                            className="text-[11px] leading-tight text-[var(--status-expired)]"
                          >
                            {pdfErrors[plan.id]}
                          </p>
                        ) : null}
                      </div>
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
