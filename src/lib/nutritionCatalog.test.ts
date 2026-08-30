import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchNutritionCatalog, formatMacroLine } from './nutritionCatalog'

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

beforeEach(() => {
  localStorage.clear()
  mockFetch.mockReset()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('fetchNutritionCatalog', () => {
  it('GETs /nutrition-catalog', async () => {
    const items = [
      {
        id: 'global-nut-mantenimiento',
        name: 'Mantenimiento',
        goal: 'Mantener peso',
        template: { dailyCaloriesKcal: 2200, proteinG: 150 },
      },
    ]
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(items),
    })

    const result = await fetchNutritionCatalog()

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/nutrition-catalog',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      }),
    )
    expect(result).toEqual(items)
  })
})

describe('formatMacroLine', () => {
  it('joins kcal and macros', () => {
    expect(
      formatMacroLine({
        dailyCaloriesKcal: 2200,
        proteinG: 150,
        carbsG: 200,
        fatG: 65,
      }),
    ).toBe('2200 kcal · P 150g · C 200g · G 65g')
  })
})
