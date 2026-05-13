import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import LoginPage from './LoginPage'

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
  localStorage.clear()
})

describe('LoginPage', () => {
  it('renders the brand tagline', () => {
    renderLoginPage()
    expect(screen.getByText(/Tu entrenamiento/)).toBeInTheDocument()
  })

  it('renders the form title', () => {
    renderLoginPage()
    expect(screen.getByText('Entrá a train.me')).toBeInTheDocument()
  })

  it('renders email and password fields', () => {
    renderLoginPage()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  it('renders Google sign-in button', () => {
    renderLoginPage()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('renders sign-up link', () => {
    renderLoginPage()
    expect(screen.getByText('¿No tenés cuenta?')).toBeInTheDocument()
    expect(screen.getByText('Registrate')).toBeInTheDocument()
  })

  it('allows filling in the form', async () => {
    const user = userEvent.setup()
    renderLoginPage()

    const email = screen.getByLabelText('Email')
    const password = screen.getByLabelText('Contraseña')

    await user.type(email, 'test@example.com')
    await user.type(password, 'password123')

    expect(email).toHaveValue('test@example.com')
    expect(password).toHaveValue('password123')
  })

  it('has a submit button', () => {
    renderLoginPage()
    const submitBtn = screen.getByRole('button', { name: 'Iniciar sesión' })
    expect(submitBtn).toHaveAttribute('type', 'submit')
  })

  it('redirects to Google OAuth on Google button click', async () => {
    const user = userEvent.setup()
    const hrefSetter = vi.fn()

    Object.defineProperty(window, 'location', {
      value: { ...window.location, href: '' },
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window.location, 'href', {
      set: hrefSetter,
      get: () => '',
      configurable: true,
    })

    renderLoginPage()
    await user.click(screen.getByText('Continuar con Google'))

    expect(hrefSetter).toHaveBeenCalledWith('/api/auth/google')
  })

  it('sign up link points to register page', () => {
    renderLoginPage()
    const link = screen.getByText('Registrate')
    expect(link).toHaveAttribute('href', '/register')
  })

  it('stores token and navigates to / on successful login', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({ accessToken: 'jwt-123', expiresIn: 604800 }),
      }),
    )

    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(localStorage.getItem('auth_token')).toBe('jwt-123')
    expect(await screen.findByText('Home')).toBeInTheDocument()
  })

  it('shows error message on invalid credentials', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            message: 'Invalid credentials',
            error: 'VALIDATION_ERROR',
          }),
      }),
    )

    const user = userEvent.setup()
    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    expect(
      await screen.findByText('Email o contraseña incorrectos'),
    ).toBeInTheDocument()
  })
})
