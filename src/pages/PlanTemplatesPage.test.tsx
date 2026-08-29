import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PlanTemplatesPage from './PlanTemplatesPage'
import { fetchNutritionCatalog } from '@/lib/nutritionCatalog'
import { createPlanTemplate, fetchPlanTemplates } from '@/lib/planTemplates'
import { ApiError } from '@/lib/api'

vi.mock('@/lib/planTemplates', async () => {
  const actual = await vi.importActual<typeof import('@/lib/planTemplates')>(
    '@/lib/planTemplates',
  )
  return {
    ...actual,
    fetchPlanTemplates: vi.fn(),
    createPlanTemplate: vi.fn(),
  }
})

vi.mock('@/lib/nutritionCatalog', async () => {
  const actual = await vi.importActual<typeof import('@/lib/nutritionCatalog')>(
    '@/lib/nutritionCatalog',
  )
  return {
    ...actual,
    fetchNutritionCatalog: vi.fn(),
  }
})

vi.mock('@/contexts/useTrainerDashboard', () => ({
  useTrainerDashboard: vi.fn(() => ({
    data: { trainer: { profileId: 'tr-1' } },
    isSuccess: true,
    isPending: false,
    isError: false,
  })),
}))

function renderPage(ui: ReactElement, path = '/app/plantillas') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/app/plantillas" element={ui} />
          <Route
            path="/app/plantillas/:templateId"
            element={<div>Editor</div>}
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const row = {
  id: 'pt-1',
  trainerId: 'tr-1',
  name: 'Fuerza 4 días',
  notes: null,
  nutritionTemplate: { dailyCaloriesKcal: 2200 },
  archivedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
}

describe('PlanTemplatesPage', () => {
  beforeEach(() => {
    vi.mocked(fetchPlanTemplates).mockReset()
    vi.mocked(createPlanTemplate).mockReset()
    vi.mocked(fetchNutritionCatalog).mockResolvedValue([
      {
        id: 'global-nut-mantenimiento',
        name: 'Mantenimiento',
        goal: 'Mantener peso',
        template: { dailyCaloriesKcal: 2200 },
      },
    ])
  })

  it('lists template rows', async () => {
    vi.mocked(fetchPlanTemplates).mockResolvedValue([row])
    renderPage(<PlanTemplatesPage />)

    expect(await screen.findByText('Fuerza 4 días')).toBeInTheDocument()
    expect(screen.getByText(/2200 kcal/)).toBeInTheDocument()
  })

  it('shows empty state', async () => {
    vi.mocked(fetchPlanTemplates).mockResolvedValue([])
    renderPage(<PlanTemplatesPage />)

    expect(
      await screen.findByText(/Todavía no tenés plantillas/i),
    ).toBeInTheDocument()
  })

  it('shows error and retries', async () => {
    vi.mocked(fetchPlanTemplates).mockRejectedValue(
      new ApiError(500, { message: 'fail' }),
    )
    renderPage(<PlanTemplatesPage />)

    expect(
      await screen.findByText(/No pudimos cargar las plantillas/i),
    ).toBeInTheDocument()
    vi.mocked(fetchPlanTemplates).mockResolvedValue([row])
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(await screen.findByText('Fuerza 4 días')).toBeInTheDocument()
  })

  it('creates a template and navigates to the editor', async () => {
    vi.mocked(fetchPlanTemplates).mockResolvedValue([])
    vi.mocked(createPlanTemplate).mockResolvedValue(row)
    renderPage(<PlanTemplatesPage />)

    await screen.findByText(/Todavía no tenés plantillas/i)
    await userEvent.type(screen.getByLabelText('Nombre'), 'Fuerza 4 días')
    await userEvent.selectOptions(
      screen.getByLabelText(/Nutrición/i),
      'global-nut-mantenimiento',
    )
    await userEvent.click(
      screen.getByRole('button', { name: 'Crear plantilla' }),
    )

    expect(createPlanTemplate).toHaveBeenCalledWith({
      trainerId: 'tr-1',
      name: 'Fuerza 4 días',
      nutritionTemplate: { dailyCaloriesKcal: 2200 },
    })
    expect(await screen.findByText('Editor')).toBeInTheDocument()
  })
})
