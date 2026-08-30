import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import SettingsPage from './SettingsPage'
import { fetchCurrentUser } from '@/lib/users'
import {
  fetchTrainerProfileByUserId,
  updateTrainerProfileByUserId,
  type TrainerProfileResponse,
} from '@/lib/trainerProfiles'
import { getMercadoPagoConnectionStatus } from '@/lib/payments'

vi.mock('@/lib/users', () => ({
  fetchCurrentUser: vi.fn(),
}))

vi.mock('@/lib/trainerProfiles', () => ({
  fetchTrainerProfileByUserId: vi.fn(),
  updateTrainerProfileByUserId: vi.fn(),
}))

vi.mock('@/lib/payments', () => ({
  getMercadoPagoConnectionStatus: vi.fn(),
  getMercadoPagoConnectUrl: vi.fn(),
  disconnectMercadoPago: vi.fn(),
}))

const trainerUser = {
  id: 'trainer-1',
  email: 'trainer@example.com',
  role: 'trainer' as const,
  isActive: true,
  emailVerifiedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

const trainerProfile: TrainerProfileResponse = {
  id: 'profile-1',
  userId: 'trainer-1',
  displayName: 'Coach Test',
  bio: null,
  experienceYears: null,
  monthlyPrice: 25000,
  certifications: null,
  isPublic: true,
  contactWhatsapp: null,
  contactEmail: null,
  contactInstagram: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function renderSettingsPage(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

  const router = createMemoryRouter(
    [{ path: '/app/configuracion', element: <SettingsPage /> }],
    { initialEntries: [initialPath] },
  )

  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )

  return { router, invalidateSpy, ...view }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(fetchCurrentUser).mockResolvedValue(trainerUser)
  vi.mocked(fetchTrainerProfileByUserId).mockResolvedValue(trainerProfile)
  vi.mocked(getMercadoPagoConnectionStatus).mockResolvedValue({
    isConnected: false,
  })
})

describe('SettingsPage Mercado Pago OAuth callback', () => {
  it('shows success message and clears query params', async () => {
    const { router } = renderSettingsPage('/app/configuracion?status=success')

    expect(
      await screen.findByText(/Mercado Pago conectado correctamente/i),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(router.state.location.search).toBe('')
    })
  })

  it('invalidates mercadoPagoStatus on success', async () => {
    const { invalidateSpy } = renderSettingsPage(
      '/app/configuracion?status=success',
    )

    await screen.findByText(/Mercado Pago conectado correctamente/i)

    await waitFor(() => {
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['mercadoPagoStatus'],
      })
    })
  })

  it('shows mapped error message and clears query params', async () => {
    const { router } = renderSettingsPage(
      '/app/configuracion?status=error&reason=MP_AUTH_DENIED',
    )

    expect(
      await screen.findByText(/rechazaste la autorización/i),
    ).toBeInTheDocument()

    await waitFor(() => {
      expect(router.state.location.search).toBe('')
    })
  })
})

describe('SettingsPage contact channels', () => {
  it('saves contact fields via PATCH', async () => {
    const user = userEvent.setup()
    vi.mocked(updateTrainerProfileByUserId).mockResolvedValue({
      ...trainerProfile,
      contactWhatsapp: '5491123456789',
      contactEmail: 'coach@test.com',
      contactInstagram: 'coach',
    })

    renderSettingsPage('/app/configuracion')

    await screen.findByDisplayValue('Coach Test')

    await user.type(screen.getByPlaceholderText('54911…'), '5491123456789')
    await user.type(screen.getByPlaceholderText('coach@…'), 'coach@test.com')
    await user.type(screen.getByPlaceholderText('miusuario'), 'coach')
    await user.click(screen.getByRole('button', { name: 'Guardar contacto' }))

    await waitFor(() => {
      expect(updateTrainerProfileByUserId).toHaveBeenCalledWith('trainer-1', {
        displayName: 'Coach Test',
        bio: null,
        monthlyPrice: 25000,
        isPublic: true,
        contactWhatsapp: '5491123456789',
        contactEmail: 'coach@test.com',
        contactInstagram: 'coach',
      })
    })
  })
})
