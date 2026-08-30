import type { SnapshotNutrition } from './plans'

export type NutritionPeriod = 'day' | 'week'

const DAYS_PER_WEEK = 7

function scale(
  value: number | undefined,
  period: NutritionPeriod,
): number | undefined {
  if (value == null) return undefined
  return period === 'week' ? value * DAYS_PER_WEEK : value
}

export function nutritionPeriodMultiplier(period: NutritionPeriod): number {
  return period === 'week' ? DAYS_PER_WEEK : 1
}

export function scaledNutritionMacros(
  nutrition: SnapshotNutrition,
  period: NutritionPeriod,
): {
  caloriesKcal?: number
  proteinG?: number
  carbsG?: number
  fatG?: number
} {
  return {
    caloriesKcal: scale(nutrition.dailyCaloriesKcal, period),
    proteinG: scale(nutrition.proteinG, period),
    carbsG: scale(nutrition.carbsG, period),
    fatG: scale(nutrition.fatG, period),
  }
}

export function formatNutritionSummary(
  nutrition: SnapshotNutrition,
  period: NutritionPeriod,
): string {
  const macros = scaledNutritionMacros(nutrition, period)
  const kcalLabel = period === 'week' ? 'kcal/semana' : 'kcal/día'
  const parts = [
    macros.caloriesKcal != null ? `${macros.caloriesKcal} ${kcalLabel}` : null,
    macros.proteinG != null ? `P ${macros.proteinG}g` : null,
    macros.carbsG != null ? `C ${macros.carbsG}g` : null,
    macros.fatG != null ? `G ${macros.fatG}g` : null,
  ].filter(Boolean)
  return parts.join(' · ')
}

type SnapshotMeal = NonNullable<SnapshotNutrition['meals']>[number]

export function scaledMeal(
  meal: SnapshotMeal,
  period: NutritionPeriod,
): SnapshotMeal {
  return {
    ...meal,
    caloriesKcal: scale(meal.caloriesKcal, period),
    proteinG: scale(meal.proteinG, period),
    carbsG: scale(meal.carbsG, period),
    fatG: scale(meal.fatG, period),
  }
}

export function formatMealMacroLine(meal: SnapshotMeal): string {
  const parts = [
    meal.caloriesKcal != null ? `${meal.caloriesKcal} kcal` : null,
    meal.proteinG != null ? `P ${meal.proteinG}g` : null,
    meal.carbsG != null ? `C ${meal.carbsG}g` : null,
    meal.fatG != null ? `G ${meal.fatG}g` : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
