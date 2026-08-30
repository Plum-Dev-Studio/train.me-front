import { describe, it, expect } from 'vitest'
import {
  formatMealMacroLine,
  formatNutritionSummary,
  scaledMeal,
  scaledNutritionMacros,
} from './nutritionSnapshot'

const nutrition = {
  dailyCaloriesKcal: 2000,
  proteinG: 150,
  carbsG: 200,
  fatG: 65,
  notes: 'Comidas reales',
  meals: [
    {
      name: 'Desayuno',
      caloriesKcal: 500,
      proteinG: 30,
      carbsG: 50,
      fatG: 15,
    },
    { name: 'Almuerzo', caloriesKcal: 700, notes: 'Con ensalada' },
  ],
}

describe('scaledNutritionMacros', () => {
  it('returns daily values for day period', () => {
    expect(scaledNutritionMacros(nutrition, 'day')).toEqual({
      caloriesKcal: 2000,
      proteinG: 150,
      carbsG: 200,
      fatG: 65,
    })
  })

  it('multiplies by 7 for week period', () => {
    expect(scaledNutritionMacros(nutrition, 'week')).toEqual({
      caloriesKcal: 14000,
      proteinG: 1050,
      carbsG: 1400,
      fatG: 455,
    })
  })
})

describe('formatNutritionSummary', () => {
  it('labels kcal per day', () => {
    expect(formatNutritionSummary(nutrition, 'day')).toBe(
      '2000 kcal/día · P 150g · C 200g · G 65g',
    )
  })

  it('labels kcal per week', () => {
    expect(formatNutritionSummary(nutrition, 'week')).toBe(
      '14000 kcal/semana · P 1050g · C 1400g · G 455g',
    )
  })
})

describe('scaledMeal', () => {
  it('scales meal macros for week', () => {
    expect(scaledMeal(nutrition.meals![0], 'week')).toEqual({
      name: 'Desayuno',
      caloriesKcal: 3500,
      proteinG: 210,
      carbsG: 350,
      fatG: 105,
    })
  })
})

describe('formatMealMacroLine', () => {
  it('joins meal fields', () => {
    expect(formatMealMacroLine(nutrition.meals![0])).toBe(
      '500 kcal · P 30g · C 50g · G 15g',
    )
  })
})
