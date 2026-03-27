import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import NotFoundPage from './NotFoundPage'

describe('NotFoundPage', () => {
  it('renders 404 heading', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders message in Spanish', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Página no encontrada')).toBeInTheDocument()
  })

  it('has a link back to home', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Volver al inicio' })
    expect(link).toHaveAttribute('href', '/')
  })
})
