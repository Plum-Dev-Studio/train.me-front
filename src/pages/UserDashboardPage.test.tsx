import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router'
import UserDashboardPage from './UserDashboardPage'
import {
  fetchMySubscription,
  retrySubscriptionCheckout,
} from '@/lib/subscriptions'
import { getPublicTrainerProfile } from '@/lib/publicTrainers'
import { downloadPlanPdf, fetchMyPlans, fetchPlanSnapshot } from '@/lib/plans'
import { ApiError } from '@/lib/api'

vi.mock('@/lib/subscriptions', () => ({
  fetchMySubscription: vi.fn(),
  retrySubscriptionCheckout: vi.fn(),
}))
vi.mock('@/lib/publicTrainers', () => ({
  getPublicTrainerProfile: vi.fn(),
}))
vi.mock('@/lib/plans', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/plans')>('@/lib/plans')
  return {
    ...actual,
    fetchMyPlans: vi.fn(),
    fetchPlanSnapshot: vi.fn(),
    downloadPlanPdf: vi.fn(),
  }
})

vi.mock('@/lib/routineWeekday', async () => {
  const actual = await vi.importActual<typeof import('@/lib/routineWeekday')>(
    '@/lib/routineWeekday',
  )
  return {
    ...actual,
    todayMondayIndex: () => 0,
  }
})

const subscription = {
  id: 'sub-1',
  userId: 'user-1',
  trainerId: 'profile-1',
  planType: 'monthly' as const,
  status: 'active' as const,
  startDate: '2026-08-01T00:00:00.000Z',
  endDate: '2026-09-01T00:00:00.000Z',
  canceledAt: null,
}

const plan = {
  id: 'plan-1',
  trainerId: 'profile-1',
  userId: 'user-1',
  templateId: 'tpl-1',
  status: 'published' as const,
  startDate: null,
  endDate: null,
  notes: null,
  nutrition: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-10T00:00:00.000Z',
}

const snapshot = {
  id: 'snap-1',
  planId: 'plan-1',
  createdAt: '2026-08-10T00:00:00.000Z',
  payload: {
    takenAt: '2026-08-10T00:00:00.000Z',
    nutrition: { dailyCaloriesKcal: 2000, proteinG: 150 },
    routines: [
      {
        id: 'rt-mon',
        name: 'Lunes fuerza',
        order: 0,
        blocks: [
          {
            id: 'b-1',
            name: 'Main',
            order: 0,
            rounds: 1,
            exercises: [{ id: 'ex-1', exerciseId: 'e-1', order: 0, reps: 10 }],
          },
        ],
      },
      {
        id: 'rt-tue',
        name: 'Martes',
        order: 1,
        blocks: [
          {
            id: 'b-2',
            name: 'Main',
            order: 0,
            rounds: 1,
            exercises: [{ id: 'ex-2', exerciseId: 'e-2', order: 0, reps: 8 }],
          },
        ],
      },
    ],
  },
}

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <UserDashboardPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('UserDashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPublicTrainerProfile).mockResolvedValue({
      id: 'profile-1',
      displayName: 'Ana Coach',
      bio: null,
      experienceYears: 5,
      monthlyPrice: 25000,
      specialties: [],
    })
  })

  it('shows empty state when the user never subscribed', async () => {
    vi.mocked(fetchMySubscription).mockRejectedValue(
      new ApiError(404, { error: 'ENTITY_NOT_FOUND' }),
    )

    renderPage()

    expect(
      await screen.findByText('Todavía no tenés una suscripción.'),
    ).toBeInTheDocument()
    expect(screen.getByText('Ver entrenadores')).toBeInTheDocument()
  })

  it('shows subscription endDate and today’s routine by default', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue(subscription)
    vi.mocked(fetchMyPlans).mockResolvedValue([plan])
    vi.mocked(fetchPlanSnapshot).mockResolvedValue(snapshot)

    renderPage()

    expect(await screen.findByText('Ana Coach')).toBeInTheDocument()
    expect(screen.getByText('Vence')).toBeInTheDocument()
    expect(await screen.findByText('Lunes fuerza')).toBeInTheDocument()
    expect(screen.queryByText('Martes')).not.toBeInTheDocument()
  })

  it('switches to another day and to the global list', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue(subscription)
    vi.mocked(fetchMyPlans).mockResolvedValue([plan])
    vi.mocked(fetchPlanSnapshot).mockResolvedValue(snapshot)
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('Lunes fuerza')

    await user.click(screen.getByRole('button', { name: 'Día' }))
    await user.click(screen.getByRole('button', { name: 'Martes' }))
    expect(
      await screen.findByRole('heading', { name: 'Martes' }),
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('heading', { name: 'Lunes fuerza' }),
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Global' }))
    expect(
      screen.getByRole('heading', { name: 'Lunes fuerza' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Martes' })).toBeInTheDocument()
  })

  it('shows empty plan copy when subscribed but no snapshot', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue(subscription)
    vi.mocked(fetchMyPlans).mockResolvedValue([])

    renderPage()

    expect(
      await screen.findByText('Tu entrenador todavía no asignó un plan.'),
    ).toBeInTheDocument()
  })

  it('downloads exercise and nutrition PDFs', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue(subscription)
    vi.mocked(fetchMyPlans).mockResolvedValue([plan])
    vi.mocked(fetchPlanSnapshot).mockResolvedValue(snapshot)
    vi.mocked(downloadPlanPdf).mockResolvedValue()
    const user = userEvent.setup()

    renderPage()
    await screen.findByText('Lunes fuerza')

    await user.click(screen.getByRole('button', { name: /Ejercicios/ }))
    expect(downloadPlanPdf).toHaveBeenCalledWith('plan-1', 'exercises')

    await user.click(screen.getByRole('button', { name: /Nutrición/ }))
    expect(downloadPlanPdf).toHaveBeenCalledWith('plan-1', 'nutrition')
  })

  it('shows retry CTA when subscription is pending and retry is allowed', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue({
      ...subscription,
      status: 'pending',
      startDate: null,
      endDate: null,
      pendingReason: 'payment_rejected',
      canRetryPayment: true,
      lastPaymentStatus: 'rejected',
    })
    vi.mocked(fetchMyPlans).mockResolvedValue([])

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'El último pago fue rechazado',
    )
    expect(
      screen.getByRole('button', { name: 'Reintentar pago' }),
    ).toBeInTheDocument()
  })

  it('shows wait copy without retry when payment is in progress', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue({
      ...subscription,
      status: 'pending',
      startDate: null,
      endDate: null,
      pendingReason: 'payment_in_progress',
      canRetryPayment: false,
      lastPaymentStatus: 'created',
    })
    vi.mocked(fetchMyPlans).mockResolvedValue([])

    renderPage()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Estamos esperando confirmación de Mercado Pago',
    )
    expect(
      screen.queryByRole('button', { name: 'Reintentar pago' }),
    ).not.toBeInTheDocument()
  })

  it('calls retry checkout when user clicks Reintentar pago', async () => {
    vi.mocked(fetchMySubscription).mockResolvedValue({
      ...subscription,
      status: 'pending',
      startDate: null,
      endDate: null,
      pendingReason: 'payment_rejected',
      canRetryPayment: true,
    })
    vi.mocked(fetchMyPlans).mockResolvedValue([])
    vi.mocked(retrySubscriptionCheckout).mockResolvedValue({
      subscriptionId: 'sub-1',
      paymentId: 'pay-2',
      preferenceId: 'pref-2',
      checkoutUrl: 'https://www.mercadopago.com.ar/checkout/retry',
    })
    const user = userEvent.setup()

    renderPage()
    await screen.findByRole('button', { name: 'Reintentar pago' })
    await user.click(screen.getByRole('button', { name: 'Reintentar pago' }))

    expect(retrySubscriptionCheckout).toHaveBeenCalled()
  })
})
