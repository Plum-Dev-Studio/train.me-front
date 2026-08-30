import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import PaymentResultSuccessPage from './PaymentResultSuccessPage'
import PaymentResultFailurePage from './PaymentResultFailurePage'
import PaymentResultPendingPage from './PaymentResultPendingPage'
import {
  getSubscriptionById,
  retrySubscriptionCheckout,
} from '@/lib/subscriptions'

vi.mock('@/lib/subscriptions', () => ({
  getSubscriptionById: vi.fn(),
  retrySubscriptionCheckout: vi.fn(),
}))

describe('Payment result pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('auth_token', 'test-jwt')
  })

  function renderPage(element: ReactNode, initialEntry = '/') {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialEntry]}>{element}</MemoryRouter>
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

  it('renders failure page with retry when subscription allows it', async () => {
    vi.mocked(getSubscriptionById).mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      trainerId: 'profile-1',
      planType: 'monthly',
      status: 'pending',
      startDate: null,
      endDate: null,
      canceledAt: null,
      pendingReason: 'payment_rejected',
      canRetryPayment: true,
      lastPaymentStatus: 'rejected',
    })
    vi.mocked(retrySubscriptionCheckout).mockResolvedValue({
      subscriptionId: 'sub-1',
      paymentId: 'pay-2',
      preferenceId: 'pref-2',
      checkoutUrl: 'https://www.mercadopago.com.ar/checkout/retry',
    })

    renderPage(
      <PaymentResultFailurePage />,
      '/payments/result/failure?subscription_id=sub-1',
    )

    expect(await screen.findByText('Pago rechazado')).toBeInTheDocument()
    expect(
      await screen.findByRole('button', { name: 'Reintentar pago' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mi panel' })).toHaveAttribute(
      'href',
      '/me',
    )
  })

  it('renders pending page with link to dashboard', async () => {
    vi.mocked(getSubscriptionById).mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      trainerId: 'profile-1',
      planType: 'monthly',
      status: 'pending',
      startDate: null,
      endDate: null,
      canceledAt: null,
      pendingReason: 'payment_in_progress',
      canRetryPayment: false,
    })

    renderPage(
      <PaymentResultPendingPage />,
      '/payments/result/pending?subscription_id=sub-1',
    )

    expect(await screen.findByText('Pago pendiente')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ir a mi panel' })).toHaveAttribute(
      'href',
      '/me',
    )
  })

  it('retries checkout from failure page', async () => {
    vi.mocked(getSubscriptionById).mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      trainerId: 'profile-1',
      planType: 'monthly',
      status: 'pending',
      startDate: null,
      endDate: null,
      canceledAt: null,
      pendingReason: 'payment_rejected',
      canRetryPayment: true,
    })
    vi.mocked(retrySubscriptionCheckout).mockResolvedValue({
      subscriptionId: 'sub-1',
      paymentId: 'pay-2',
      preferenceId: 'pref-2',
      checkoutUrl: 'https://www.mercadopago.com.ar/checkout/retry',
    })
    const user = userEvent.setup()

    renderPage(
      <PaymentResultFailurePage />,
      '/payments/result/failure?subscription_id=sub-1',
    )

    await user.click(
      await screen.findByRole('button', { name: 'Reintentar pago' }),
    )
    expect(retrySubscriptionCheckout).toHaveBeenCalled()
  })
})
