import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NutritionCatalogPage from './NutritionCatalogPage'
import { fetchNutritionCatalog } from '@/lib/nutritionCatalog'
import { ApiError } from '@/lib/api'

vi.mock('@/lib/nutritionCatalog', async () => {
  const actual = await vi.importActual<typeof import('@/lib/nutritionCatalog')>(
    '@/lib/nutritionCatalog',
  )
  return {
    ...actual,
    fetchNutritionCatalog: vi.fn(),
  }
})

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

const presets = [
  {
    id: 'global-nut-mantenimiento',
    name: 'Mantenimiento',
    goal: 'Mantener peso',
    template: {
      dailyCaloriesKcal: 2200,
      proteinG: 150,
      carbsG: 200,
      fatG: 65,
      notes: 'Comidas reales',
      meals: [
        { name: 'Desayuno', caloriesKcal: 500 },
        { name: 'Almuerzo', caloriesKcal: 700 },
      ],
    },
  },
]

describe('NutritionCatalogPage', () => {
  beforeEach(() => {
    vi.mocked(fetchNutritionCatalog).mockReset()
  })

  it('lists preset name, goal and kcal', async () => {
    vi.mocked(fetchNutritionCatalog).mockResolvedValue(presets)
    renderWithQuery(<NutritionCatalogPage />)

    expect(await screen.findByText('Mantenimiento')).toBeInTheDocument()
    expect(screen.getByText(/Mantener peso/)).toBeInTheDocument()
    expect(screen.getByText(/2200 kcal/)).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    vi.mocked(fetchNutritionCatalog).mockResolvedValue([])
    renderWithQuery(<NutritionCatalogPage />)

    expect(
      await screen.findByText(/No hay plantillas nutricionales precargadas/i),
    ).toBeInTheDocument()
  })

  it('shows error and retries', async () => {
    vi.mocked(fetchNutritionCatalog).mockRejectedValue(
      new ApiError(500, { message: 'fail' }),
    )
    renderWithQuery(<NutritionCatalogPage />)

    expect(
      await screen.findByText(/No pudimos cargar el catálogo/i),
    ).toBeInTheDocument()
    vi.mocked(fetchNutritionCatalog).mockResolvedValue(presets)
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Mantenimiento')).toBeInTheDocument()
  })

  it('expands meals', async () => {
    vi.mocked(fetchNutritionCatalog).mockResolvedValue(presets)
    renderWithQuery(<NutritionCatalogPage />)

    const toggle = await screen.findByRole('button', {
      name: /Mantenimiento/i,
    })
    expect(screen.queryByText('Desayuno')).not.toBeInTheDocument()
    await userEvent.click(toggle)
    expect(screen.getByText(/Desayuno/)).toBeInTheDocument()
    expect(screen.getByText(/Almuerzo/)).toBeInTheDocument()
  })
})
