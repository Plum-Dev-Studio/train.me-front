import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router'
import { UserRoleRoute } from './UserRoleRoute'
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
          <Route path="/app" element={<div>Trainer App</div>} />
          <Route element={<UserRoleRoute />}>
            <Route path="/me" element={<div>User Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UserRoleRoute', () => {
  it('redirects to /login when no token', () => {
    renderWithProviders('/me')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders the dashboard when role is user', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-1',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithProviders('/me')

    expect(await screen.findByText('User Dashboard')).toBeInTheDocument()
  })

  it('redirects trainers to /app', async () => {
    localStorage.setItem('auth_token', 'valid-token')
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-2',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithProviders('/me')

    expect(await screen.findByText('Trainer App')).toBeInTheDocument()
  })
})
