import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router'
import { PublicOnlyRoute } from './PublicOnlyRoute'

beforeEach(() => {
  localStorage.clear()
})

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<div>Login Page</div>} />
        </Route>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('PublicOnlyRoute', () => {
  it('renders child route when no token', () => {
    renderWithRouter('/login')
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Home')).not.toBeInTheDocument()
  })

  it('redirects to / when token exists', () => {
    localStorage.setItem('auth_token', 'valid-token')
    renderWithRouter('/login')
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument()
  })
})
