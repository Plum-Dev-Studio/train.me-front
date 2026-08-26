import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import RegisterPage from './RegisterPage'

function renderRegisterPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('RegisterPage', () => {
  it('renders the form title', () => {
    renderRegisterPage()
    expect(screen.getByText('Creá tu cuenta')).toBeInTheDocument()
  })

  it('renders all form fields', () => {
    renderRegisterPage()
    expect(screen.getByLabelText('Nombre completo')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument()
  })

  it('renders Google sign-up button', () => {
    renderRegisterPage()
    expect(screen.getByText('Continuar con Google')).toBeInTheDocument()
  })

  it('renders login link', () => {
    renderRegisterPage()
    expect(screen.getByText('Iniciá sesión')).toBeInTheDocument()
  })

  it('allows filling in the form', async () => {
    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nombre completo'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('John Doe')
    expect(screen.getByLabelText('Email')).toHaveValue('test@example.com')
    expect(screen.getByLabelText('Contraseña')).toHaveValue('password123')
  })

  it('has a submit button', () => {
    renderRegisterPage()
    const submitBtn = screen.getByRole('button', { name: 'Crear cuenta' })
    expect(submitBtn).toHaveAttribute('type', 'submit')
  })

  it('shows success message after registration', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ message: 'Verification email sent' }),
      }),
    )

    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nombre completo'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText(/revisá tu bandeja de entrada/i),
    ).toBeInTheDocument()
  })

  it('shows error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: () =>
          Promise.resolve({
            message: 'Email already registered',
            error: 'VALIDATION_ERROR',
          }),
      }),
    )

    const user = userEvent.setup()
    renderRegisterPage()

    await user.type(screen.getByLabelText('Nombre completo'), 'John Doe')
    await user.type(screen.getByLabelText('Email'), 'existing@example.com')
    await user.type(screen.getByLabelText('Contraseña'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    expect(
      await screen.findByText(/Email already registered/i),
    ).toBeInTheDocument()
  })
})
