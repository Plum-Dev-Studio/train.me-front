import type { ReactElement } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClientTrainerNotesPanel } from './ClientTrainerNotesPanel'
import { updateTrainerClientNotes } from '@/lib/trainerClients'

vi.mock('@/lib/trainerClients', () => ({
  updateTrainerClientNotes: vi.fn(),
}))

function renderWithQuery(ui: ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

describe('ClientTrainerNotesPanel', () => {
  beforeEach(() => {
    vi.mocked(updateTrainerClientNotes).mockResolvedValue({
      id: 'tc-1',
      trainerId: 'tr-1',
      userId: 'u-1',
      status: 'active',
      activeSubscriptionId: null,
      trainerNotes: 'Updated note',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
  })

  it('PATCHes notes on save', async () => {
    renderWithQuery(
      <ClientTrainerNotesPanel
        clientId="tc-1"
        initialNotes="Old"
        trainerProfileId="tr-1"
      />,
    )

    const textarea = screen.getByLabelText('Notas privadas del entrenador')
    await userEvent.clear(textarea)
    await userEvent.type(textarea, 'Updated note')
    await userEvent.click(screen.getByRole('button', { name: 'Guardar notas' }))

    expect(updateTrainerClientNotes).toHaveBeenCalledWith(
      'tc-1',
      'Updated note',
    )
    expect(await screen.findByText(/Notas guardadas/i)).toBeInTheDocument()
  })
})
