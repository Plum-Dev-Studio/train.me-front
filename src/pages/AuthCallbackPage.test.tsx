import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import AuthCallbackPage from './AuthCallbackPage'
import { fetchCurrentUser } from '@/lib/users'

vi.mock('@/lib/users', () => ({
  fetchCurrentUser: vi.fn(),
}))

beforeEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

function renderWithRouter(initialEntry: {
  pathname: string
  hash?: string
  search?: string
}) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/" element={<div>Regular Home</div>} />
        <Route path="/app" element={<div>App Home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthCallbackPage', () => {
  it('stores token and navigates to /app for trainer users', async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-1',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token&expiresIn=3600',
    })

    expect(localStorage.getItem('auth_token')).toBe('my-jwt-token')
    expect(await screen.findByText('App Home')).toBeInTheDocument()
  })

  it('stores token and navigates to regular home for non-trainer users', async () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-2',
      email: 'user@example.com',
      role: 'user',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })

    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token&expiresIn=3600',
    })

    expect(localStorage.getItem('auth_token')).toBe('my-jwt-token')
    expect(await screen.findByText('Regular Home')).toBeInTheDocument()
  })

  it('clears URL hash after successful token parse', () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-3',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token',
    })

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/auth/callback')
    replaceStateSpy.mockRestore()
  })

  it('uses post_login_redirect when present', () => {
    vi.mocked(fetchCurrentUser).mockResolvedValue({
      id: 'u-4',
      email: 'trainer@example.com',
      role: 'trainer',
      isActive: true,
      emailVerifiedAt: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    })
    localStorage.setItem('post_login_redirect', '/entrenadores/trainer-1')

    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token',
    })

    expect(screen.queryByText('App Home')).not.toBeInTheDocument()
    expect(localStorage.getItem('post_login_redirect')).toBeNull()
  })

  it('shows error message for account_deactivated', () => {
    renderWithRouter({
      pathname: '/auth/callback',
      search: '?error=account_deactivated',
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(screen.getByText(/Tu cuenta fue desactivada/i)).toBeInTheDocument()
  })

  it('shows error message for auth_failed', () => {
    renderWithRouter({
      pathname: '/auth/callback',
      search: '?error=auth_failed',
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(screen.getByText(/Error de autenticación/i)).toBeInTheDocument()
  })

  it('shows error message for verification_failed', () => {
    renderWithRouter({
      pathname: '/auth/callback',
      search: '?error=verification_failed',
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(
      screen.getByText(/enlace de verificación es inválido o expiró/i),
    ).toBeInTheDocument()
    expect(screen.getByText('Volver al inicio de sesión')).toBeInTheDocument()
  })

  it('navigates to /login when no hash and no error', () => {
    renderWithRouter({
      pathname: '/auth/callback',
    })

    expect(localStorage.getItem('auth_token')).toBeNull()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })
})
