import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
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

  it('sign up link does not trigger navigation', () => {
    renderLoginPage()
    const link = screen.getByText('Registrate')
    expect(link).toHaveAttribute('href', '#')
  })
})
