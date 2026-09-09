import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import {
  fetchNutritionCatalog,
  formatMacroLine,
  type NutritionCatalogItem,
} from '@/lib/nutritionCatalog'

export default function NutritionCatalogPage() {
  const query = useQuery({
    queryKey: ['nutrition-catalog'],
    queryFn: () => fetchNutritionCatalog(),
  })
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <PageHeader
        title="Nutrición"
        description="Plantillas de macros y comidas para armar el plan nutricional"
      />

      <div className="flex flex-1 flex-col gap-4 overflow-auto p-8">
        {query.isPending ? (
          <p className="text-[14px] text-[var(--text-secondary)]">
            Cargando catálogo…
          </p>
        ) : query.isError ? (
          <div className="flex flex-col gap-3">
            <p className="text-[14px] text-[var(--text-secondary)]">
              No pudimos cargar el catálogo
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
          query.data.length === 0 ? (
            <p className="text-[14px] text-[var(--text-secondary)]">
              No hay plantillas nutricionales precargadas.
            </p>
          ) : (
            <ul className="flex min-h-[240px] flex-1 flex-col gap-3 overflow-auto">
              {query.data.map((preset) => (
                <NutritionPresetCard
                  key={preset.id}
                  preset={preset}
                  open={openId === preset.id}
                  onToggle={() =>
                    setOpenId((id) => (id === preset.id ? null : preset.id))
                  }
                />
              ))}
            </ul>
          )
        ) : null}
      </div>
    </div>
  )
}

function NutritionPresetCard({
  preset,
  open,
  onToggle,
}: {
  preset: NutritionCatalogItem
  open: boolean
  onToggle: () => void
}) {
  const meals = preset.template.meals ?? []
  const macros = formatMacroLine(preset.template)
  return (
    <li className="overflow-hidden rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full flex-col gap-1 px-4 py-3 text-left hover:bg-[#E4E4E712]"
      >
        <span className="text-[15px] font-semibold text-[var(--text-primary)]">
          {preset.name}
        </span>
        <span className="text-[13px] text-[var(--text-secondary)]">
          {preset.goal}
          {macros ? ` · ${macros}` : ''}
        </span>
      </button>
      {open ? (
        <div className="border-t border-[var(--border-standard)] px-4 py-3">
          {preset.template.notes ? (
            <p className="mb-3 text-[13px] text-[var(--text-secondary)]">
              {preset.template.notes}
            </p>
          ) : null}
          {meals.length === 0 ? (
            <p className="text-[13px] text-[var(--text-secondary)]">
              Sin comidas en esta plantilla.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {meals.map((meal, i) => (
                <li
                  key={`${preset.id}-meal-${i}`}
                  className="text-[13px] text-[var(--text-primary)]"
                >
                  <span className="font-medium">{meal.name ?? 'Comida'}</span>
                  {meal.caloriesKcal != null
                    ? ` · ${meal.caloriesKcal} kcal`
                    : ''}
                  {meal.notes ? (
                    <span className="text-[var(--text-secondary)]">
                      {' '}
                      — {meal.notes}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </li>
  )
}
