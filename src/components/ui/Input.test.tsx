import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" id="email" />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('renders without label', () => {
    render(<Input placeholder="Type here" />)
    expect(screen.getByPlaceholderText('Type here')).toBeInTheDocument()
    expect(screen.queryByRole('label')).not.toBeInTheDocument()
  })

  it('shows error message', () => {
    render(<Input label="Email" id="email" error="Required field" />)
    expect(screen.getByText('Required field')).toBeInTheDocument()
  })

  it('applies error border styles', () => {
    render(<Input label="Email" id="email" error="Bad" />)
    const input = screen.getByLabelText('Email')
    expect(input.className).toContain('border-[var(--status-expired)]')
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<Input label="Email" id="email" />)

    const input = screen.getByLabelText('Email')
    await user.type(input, 'test@example.com')
    expect(input).toHaveValue('test@example.com')
  })

  it('forwards native input props', () => {
    render(<Input type="email" required placeholder="email" />)
    const input = screen.getByPlaceholderText('email')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toBeRequired()
  })
})
