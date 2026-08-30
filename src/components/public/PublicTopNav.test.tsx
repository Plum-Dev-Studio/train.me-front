import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { PublicTopNav } from './PublicTopNav'
import { fetchCurrentUser } from '@/lib/users'

vi.mock('@/components/BecomeTrainerButton', () => ({
  BecomeTrainerButton: () => <button type="button">Soy entrenador</button>,
}))

vi.mock('@/lib/users', () => ({
  fetchCurrentUser: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function renderNav(initialPath = '/entrenadores') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="*" element={<PublicTopNav />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('PublicTopNav', () => {
  it('shows guest CTAs when not logged in', () => {
    renderNav()

    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
  })

  it('shows trainer action in user menu when logged in as trainer', async () => {
    localStorage.setItem('auth_token', 'token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-1',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderNav()
    await userEvent.click(
      await screen.findByRole('button', { name: /abrir menú/i }),
    )

    expect(screen.getByText('Ir a mi panel')).toBeInTheDocument()
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
  })

  it('shows Mi plan in the menu for a logged-in user', async () => {
    localStorage.setItem('auth_token', 'token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-3',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderNav()
    await userEvent.click(
      await screen.findByRole('button', { name: /abrir menú/i }),
    )

    expect(screen.getByText('Mi plan')).toBeInTheDocument()
    expect(screen.getByText('Soy entrenador')).toBeInTheDocument()
  })

  it('logs out and goes back to guest CTAs', async () => {
    localStorage.setItem('auth_token', 'token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-2',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderNav()
    await userEvent.click(
      await screen.findByRole('button', { name: /abrir menú/i }),
    )
    await userEvent.click(screen.getByText('Cerrar sesión'))

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
    expect(screen.getByText('Crear cuenta')).toBeInTheDocument()
  })
})
