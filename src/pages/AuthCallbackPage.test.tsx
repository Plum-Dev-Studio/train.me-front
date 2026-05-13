import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import AuthCallbackPage from './AuthCallbackPage'

beforeEach(() => {
  localStorage.clear()
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
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('AuthCallbackPage', () => {
  it('stores token and navigates to / on success', () => {
    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token&expiresIn=3600',
    })

    expect(localStorage.getItem('auth_token')).toBe('my-jwt-token')
    expect(screen.getByText('Home')).toBeInTheDocument()
  })

  it('clears URL hash after successful token parse', () => {
    const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

    renderWithRouter({
      pathname: '/auth/callback',
      hash: '#token=my-jwt-token',
    })

    expect(replaceStateSpy).toHaveBeenCalledWith(null, '', '/auth/callback')
    replaceStateSpy.mockRestore()
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
