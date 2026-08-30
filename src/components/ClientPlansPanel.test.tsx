import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientPlansPanel } from './ClientPlansPanel'
import { fetchTrainerClientPlans } from '@/lib/trainerClients'

vi.mock('@/lib/trainerClients', () => ({
  fetchTrainerClientPlans: vi.fn(),
}))

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ClientPlansPanel', () => {
  beforeEach(() => {
    vi.mocked(fetchTrainerClientPlans).mockResolvedValue([
      {
        id: 'plan-draft-1',
        trainerId: 'tr-1',
        userId: 'u-1',
        templateId: 'pt-1',
        status: 'draft',
        startDate: '2026-09-01T00:00:00.000Z',
        endDate: null,
        notes: null,
        nutrition: null,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-08-01T00:00:00.000Z',
      },
      {
        id: 'plan-pub-1',
        trainerId: 'tr-1',
        userId: 'u-1',
        templateId: 'pt-1',
        status: 'published',
        startDate: null,
        endDate: '2026-12-01T00:00:00.000Z',
        notes: null,
        nutrition: null,
        createdAt: '2026-08-02T00:00:00.000Z',
        updatedAt: '2026-08-02T00:00:00.000Z',
      },
    ])
  })

  it('lists draft and published plans for the client', async () => {
    renderWithQuery(<ClientPlansPanel clientId="tc-1" />)

    expect(await screen.findByText('Borrador')).toBeInTheDocument()
    expect(screen.getByText('Publicado')).toBeInTheDocument()
    expect(fetchTrainerClientPlans).toHaveBeenCalledWith('tc-1')
  })

  it('shows empty state when no plans', async () => {
    vi.mocked(fetchTrainerClientPlans).mockResolvedValue([])

    renderWithQuery(<ClientPlansPanel clientId="tc-1" />)

    expect(
      await screen.findByText(/aún no tiene planes asignados/i),
    ).toBeInTheDocument()
  })
})
