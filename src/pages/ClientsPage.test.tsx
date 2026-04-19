import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ClientsPage from './ClientsPage'
import { fetchTrainerClientsWithUsers } from '@/lib/trainerClients'

vi.mock('@/lib/trainerClients', () => ({
  fetchTrainerClientsWithUsers: vi.fn(),
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
    vi.mocked(fetchTrainerClientsWithUsers).mockResolvedValue({
      list: {
        data: [
          {
            id: 'tc-1',
            trainerId: 'tr-1',
            userId: 'user-1',
            status: 'active',
            activeSubscriptionId: 'sub-abc',
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
})
