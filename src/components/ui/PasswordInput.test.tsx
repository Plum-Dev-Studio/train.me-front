import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('renders as password type by default', () => {
    render(<PasswordInput label="Contraseña" id="pass" />)
    expect(screen.getByLabelText('Contraseña')).toHaveAttribute(
      'type',
      'password',
    )
  })

  it('toggles visibility when eye icon is clicked', async () => {
    const user = userEvent.setup()
    render(<PasswordInput label="Contraseña" id="pass" />)

    const input = screen.getByLabelText('Contraseña')
    const toggleBtn = screen.getByRole('button')

    expect(input).toHaveAttribute('type', 'password')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'text')

    await user.click(toggleBtn)
    expect(input).toHaveAttribute('type', 'password')
  })

  it('shows error message', () => {
    render(<PasswordInput label="Pass" id="pass" error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })

  it('renders labelAction', () => {
    render(
      <PasswordInput
        label="Pass"
        id="pass"
        labelAction={<a href="#">Forgot?</a>}
      />,
    )
    expect(screen.getByText('Forgot?')).toBeInTheDocument()
  })

  it('accepts user input', async () => {
    const user = userEvent.setup()
    render(<PasswordInput label="Pass" id="pass" />)

    const input = screen.getByLabelText('Pass')
    await user.type(input, 'secret123')
    expect(input).toHaveValue('secret123')
  })

  it('toggle button does not steal focus from input', () => {
    render(<PasswordInput label="Pass" id="pass" />)
    const toggleBtn = screen.getByRole('button')
    expect(toggleBtn).toHaveAttribute('tabindex', '-1')
  })
})
