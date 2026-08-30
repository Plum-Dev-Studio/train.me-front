import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClientsPage from './ClientsPage'
import { fetchTrainerClientsWithUsers, fetchTrainerClientPlans } from '@/lib/trainerClients'

vi.mock('@/lib/trainerClients', () => ({
  fetchTrainerClientsWithUsers: vi.fn(),
  updateTrainerClientNotes: vi.fn(),
  fetchTrainerClientPlans: vi.fn(),
}))

vi.mock('@/lib/questionnaires', () => ({
  fetchClientIntakeResponse: vi.fn().mockRejectedValue(new Error('skip')),
}))

vi.mock('@/contexts/useTrainerDashboard', () => ({
  useTrainerDashboard: vi.fn(() => ({
    data: { trainer: { profileId: 'tr-1' } },
    isSuccess: true,
    isPending: false,
    isError: false,
  })),
}))

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ClientsPage', () => {
  beforeEach(() => {
    vi.mocked(fetchTrainerClientPlans).mockResolvedValue([
      {
        id: 'plan-1',
        trainerId: 'tr-1',
        userId: 'user-1',
        templateId: 'pt-1',
        status: 'published',
        startDate: null,
        endDate: null,
        notes: null,
        nutrition: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
    ])
    vi.mocked(fetchTrainerClientsWithUsers).mockResolvedValue({
      list: {
        data: [
          {
            id: 'tc-1',
            trainerId: 'tr-1',
            userId: 'user-1',
            status: 'active',
            activeSubscriptionId: 'sub-abc',
            trainerNotes: 'Lesión rodilla',
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-04-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 20,
      },
      usersById: {
        'user-1': {
          id: 'user-1',
          email: 'cliente@test.com',
          role: 'user',
          isActive: true,
          emailVerifiedAt: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
        },
      },
    })
  })

  it('renders client email and status from API', async () => {
    renderWithQuery(<ClientsPage />)

    expect(await screen.findByText('cliente@test.com')).toBeInTheDocument()
    expect(screen.getByText('Activo')).toBeInTheDocument()
    expect(screen.getByText('Clientes')).toBeInTheDocument()
  })

  it('shows trainer notes and client plans when a client is selected', async () => {
    const user = userEvent.setup()
    renderWithQuery(<ClientsPage />)

    await screen.findByText('cliente@test.com')
    await user.click(screen.getByText('cliente@test.com'))

    expect(
      await screen.findByLabelText('Notas privadas del entrenador'),
    ).toHaveValue('Lesión rodilla')
    expect(await screen.findByText('Publicado')).toBeInTheDocument()
    expect(fetchTrainerClientPlans).toHaveBeenCalledWith('tc-1')
  })
})
