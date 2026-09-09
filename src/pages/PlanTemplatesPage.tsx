import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { useTrainerDashboard } from '@/contexts/useTrainerDashboard'
import { ApiError } from '@/lib/api'
import { formatShortDate } from '@/lib/format'
import { fetchNutritionCatalog } from '@/lib/nutritionCatalog'
import { createPlanTemplate, fetchPlanTemplates } from '@/lib/planTemplates'

const GRID_COLS = 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_120px_100px]'

export default function PlanTemplatesPage() {
  const dashboard = useTrainerDashboard()
  const trainerProfileId = dashboard.data?.trainer.profileId
  const navigate = useNavigate()

  const listQuery = useQuery({
    queryKey: ['plan-templates', trainerProfileId],
    queryFn: () => fetchPlanTemplates(trainerProfileId!),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  const catalogQuery = useQuery({
    queryKey: ['nutrition-catalog'],
    queryFn: () => fetchNutritionCatalog(),
    enabled: Boolean(trainerProfileId) && dashboard.isSuccess,
  })

  const [name, setName] = useState('')
  const [presetId, setPresetId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!trainerProfileId || !name.trim()) return
    setCreating(true)
    setCreateError(null)
    const preset = catalogQuery.data?.find((item) => item.id === presetId)
    try {
      const created = await createPlanTemplate({
        trainerId: trainerProfileId,
        name: name.trim(),
        nutritionTemplate: preset?.template ?? null,
      })
      navigate(`/app/plantillas/${created.id}`)
    } catch (err) {
      if (err instanceof ApiError) {
        setCreateError(
          `No se pudo crear la plantilla (${err.status}). Intentá de nuevo.`,
        )
      } else {
        setCreateError('No se pudo crear la plantilla. Intentá de nuevo.')
      }
      setCreating(false)
    }
  }

  if (dashboard.isPending) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Plantillas" />
        <p className="p-8 text-[14px] text-[var(--text-secondary)]">
          Cargando…
        </p>
      </div>
    )
  }

  if (dashboard.isError || !trainerProfileId) {
    return (
      <div className="flex h-full flex-col">
        <PageHeader title="Plantillas" />
        <div className="flex flex-col gap-3 p-8">
          <p className="text-[14px] text-[var(--text-secondary)]">
            Necesitamos tu perfil de entrenador para listar plantillas.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Plantillas"
        description="Armá una plantilla y asignala a un cliente. La nutrición se elige al crear."
      />

      <div className="flex flex-1 flex-col gap-6 overflow-auto p-8">
        <form
          onSubmit={(e) => void handleCreate(e)}
          className="flex flex-col gap-3 rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4"
        >
          <p className="text-[14px] font-semibold text-[var(--text-primary)]">
            Nueva plantilla
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              Nombre
            </span>
            <input
              id="template-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[14px] font-medium text-[var(--text-primary)]">
              Nutrición (opcional)
            </span>
            <select
              id="template-nutrition"
              value={presetId}
              onChange={(e) => setPresetId(e.target.value)}
              className="h-11 w-full rounded-[10px] border border-[var(--border-standard)] bg-transparent px-3.5 text-[14px] text-[var(--text-primary)] focus:border-[var(--accent-purple)] focus:outline-none"
            >
              <option value="">Sin preset</option>
              {(catalogQuery.data ?? []).map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </label>
          {createError ? (
            <p
              role="alert"
              className="text-[13px] text-[var(--status-expired)]"
            >
              {createError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            Crear plantilla
          </button>
        </form>

        {listQuery.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando plantillas…
          </p>
        ) : listQuery.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar las plantillas
              {listQuery.error?.message ? ` (${listQuery.error.message})` : ''}.
            </p>
            <button
              type="button"
              onClick={() => void listQuery.refetch()}
              disabled={listQuery.isFetching}
              className="w-fit rounded-xl bg-[var(--accent-purple)] px-5 py-2.5 text-[14px] font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              Reintentar
            </button>
          </div>
        ) : listQuery.data ? (
          listQuery.data.length === 0 ? (
            <p className="text-[14px] text-[var(--text-secondary)]">
              Todavía no tenés plantillas.
            </p>
          ) : (
            <div className="flex min-h-[240px] flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
              <div
                className={`grid ${GRID_COLS} gap-2 border-b border-[var(--border-standard)] px-4 py-3 text-[12px] font-semibold text-[var(--text-secondary)]`}
              >
                <span>Nombre</span>
                <span>Nutrición</span>
                <span>Actualizado</span>
                <span />
              </div>
              <ul className="flex-1 overflow-auto divide-y divide-[#E4E4E720]">
                {listQuery.data.map((row) => (
                  <li
                    key={row.id}
                    className={`grid ${GRID_COLS} gap-2 px-4 py-3 text-[13px] text-[var(--text-primary)]`}
                  >
                    <span className="truncate font-medium">{row.name}</span>
                    <span className="text-[var(--text-secondary)]">
                      {row.nutritionTemplate?.dailyCaloriesKcal != null
                        ? `${row.nutritionTemplate.dailyCaloriesKcal} kcal`
                        : 'Sin nutrición'}
                    </span>
                    <span className="text-[var(--text-secondary)]">
                      {formatShortDate(row.updatedAt)}
                    </span>
                    <Link
                      to={`/app/plantillas/${row.id}`}
                      className="text-[13px] font-semibold text-[var(--accent-purple)] hover:opacity-80"
                    >
                      Editar
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
