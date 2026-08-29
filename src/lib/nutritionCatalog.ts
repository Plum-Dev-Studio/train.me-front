import { apiFetch } from './api'
import type { SnapshotNutrition } from './plans'

export interface NutritionCatalogItem {
  id: string
  name: string
  goal: string
  template: SnapshotNutrition
}

export async function fetchNutritionCatalog(): Promise<
  NutritionCatalogItem[]
> {
  return apiFetch<NutritionCatalogItem[]>('/nutrition-catalog')
}

export function formatMacroLine(template: SnapshotNutrition): string {
  const parts = [
    template.dailyCaloriesKcal != null
      ? `${template.dailyCaloriesKcal} kcal`
      : null,
    template.proteinG != null ? `P ${template.proteinG}g` : null,
    template.carbsG != null ? `C ${template.carbsG}g` : null,
    template.fatG != null ? `G ${template.fatG}g` : null,
  ].filter(Boolean)
  return parts.join(' · ')
}
