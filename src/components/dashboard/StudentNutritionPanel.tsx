import { useState } from 'react'
import type { SnapshotNutrition } from '@/lib/plans'
import {
  formatMealMacroLine,
  formatNutritionSummary,
  scaledMeal,
  type NutritionPeriod,
} from '@/lib/nutritionSnapshot'

export function StudentNutritionPanel({
  nutrition,
}: {
  nutrition: SnapshotNutrition | null
}) {
  const [period, setPeriod] = useState<NutritionPeriod>('day')

  if (!nutrition) {
    return (
      <p className="text-[14px] text-[var(--text-secondary)]">
        Todavía no hay guía de nutrición en tu plan.
      </p>
    )
  }

  const meals = nutrition.meals ?? []
  const summary = formatNutritionSummary(nutrition, period)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ['day', 'Día'],
            ['week', 'Semana'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPeriod(id)}
            className={`rounded-lg px-3 py-2 text-[14px] font-medium ${
              period === id
                ? 'bg-[var(--accent-purple)] text-white'
                : 'border border-[var(--border-standard)] text-[var(--text-primary)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {summary ? (
        <p className="text-[15px] font-medium text-[var(--text-primary)]">
          {summary}
        </p>
      ) : (
        <p className="text-[14px] text-[var(--text-secondary)]">
          Plan nutricional
        </p>
      )}

      {nutrition.notes ? (
        <p className="text-[13px] text-[var(--text-secondary)]">
          {nutrition.notes}
        </p>
      ) : null}

      {meals.length === 0 ? (
        <p className="text-[14px] text-[var(--text-secondary)]">
          Sin comidas sugeridas en tu plan.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {meals.map((meal, index) => {
            const scaled = scaledMeal(meal, period)
            const macroLine = formatMealMacroLine(scaled)
            return (
              <li
                key={`${meal.name ?? 'meal'}-${index}`}
                className="rounded-2xl border border-[var(--border-standard)] bg-[var(--bg-card)] p-4"
              >
                <p className="text-[15px] font-semibold text-[var(--text-primary)]">
                  {meal.name ?? 'Comida'}
                </p>
                {macroLine ? (
                  <p className="mt-1 text-[13px] text-[var(--text-secondary)]">
                    {macroLine}
                  </p>
                ) : null}
                {meal.notes ? (
                  <p className="mt-2 text-[13px] text-[var(--text-secondary)]">
                    {meal.notes}
                  </p>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
