import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import PaymentResultSuccessPage from './PaymentResultSuccessPage'
import PaymentResultFailurePage from './PaymentResultFailurePage'
import PaymentResultPendingPage from './PaymentResultPendingPage'

describe('Payment result pages', () => {
  function renderPage(element: ReactNode) {
    const queryClient = new QueryClient()
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{element}</MemoryRouter>
      </QueryClientProvider>,
    )
  }

  it('renders success page content and link', () => {
    renderPage(<PaymentResultSuccessPage />)

    expect(screen.getByText('Pago aprobado')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Seguir explorando entrenadores' }),
    ).toHaveAttribute('href', '/entrenadores')
  })

  it('renders failure page content and link', () => {
    renderPage(<PaymentResultFailurePage />)

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver a entrenadores' }),
    ).toHaveAttribute('href', '/entrenadores')
  })

  it('renders pending page content and link', () => {
    renderPage(<PaymentResultPendingPage />)

    expect(screen.getByText('Pago pendiente')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Volver a entrenadores' }),
    ).toHaveAttribute('href', '/entrenadores')
  })
})
