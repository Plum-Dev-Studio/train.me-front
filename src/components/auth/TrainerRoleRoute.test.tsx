import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { TrainerRoleRoute } from './TrainerRoleRoute'
import { fetchCurrentUser } from '@/lib/users'

vi.mock('@/lib/users', () => ({
  fetchCurrentUser: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function renderWithProviders(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Regular Home</div>} />
          <Route element={<TrainerRoleRoute />}>
            <Route path="/app" element={<div>Trainer App</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TrainerRoleRoute', () => {
  it('redirects to /login when no token', () => {
    renderWithProviders('/app')

    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Trainer App')).not.toBeInTheDocument()
  })

  it('renders protected app when role is trainer', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-1',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithProviders('/app')

    expect(await screen.findByText('Trainer App')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })

  it('redirects authenticated non-trainer to regular home', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-2',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithProviders('/app')

    expect(await screen.findByText('Regular Home')).toBeInTheDocument()
    expect(screen.queryByText('Trainer App')).not.toBeInTheDocument()
  })
})
