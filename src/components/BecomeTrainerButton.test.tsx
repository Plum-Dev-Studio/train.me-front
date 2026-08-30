import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { BecomeTrainerButton } from './BecomeTrainerButton'
import { registerAsTrainer } from '@/lib/trainerProfiles'

vi.mock('@/lib/trainerProfiles', () => ({
  registerAsTrainer: vi.fn(),
}))

function renderButton(initialPath = '/') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const view = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/" element={<BecomeTrainerButton />} />
          <Route path="/app" element={<div>Trainer app</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { invalidateSpy, ...view }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(registerAsTrainer).mockResolvedValue({
    id: 'tp-1',
    userId: 'user-1',
    displayName: 'Coach',
    bio: null,
    experienceYears: null,
    monthlyPrice: null,
    certifications: null,
    isPublic: true,
    contactWhatsapp: null,
    contactEmail: null,
    contactInstagram: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  })
})

describe('BecomeTrainerButton', () => {
  it('registers as trainer and redirects to /app', async () => {
    const user = userEvent.setup()
    const { invalidateSpy } = renderButton()

    await user.click(screen.getByRole('button', { name: 'Soy entrenador' }))

    await waitFor(() => {
      expect(registerAsTrainer).toHaveBeenCalled()
    })
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['currentUser'] })
    expect(await screen.findByText('Trainer app')).toBeInTheDocument()
  })
})
