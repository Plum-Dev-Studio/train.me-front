import { test, expect, type Page, type Route } from '@playwright/test'

const pendingSubscription = {
  id: 'sub-pending-1',
  userId: 'user-e2e-1',
  trainerId: 'trainer-e2e-1',
  planType: 'monthly',
  status: 'pending',
  startDate: null,
  endDate: null,
  canceledAt: null,
  pendingReason: 'payment_rejected',
  canRetryPayment: true,
  lastPaymentStatus: 'rejected',
}

const currentUser = {
  id: 'user-e2e-1',
  email: 'client@example.com',
  role: 'user',
  isActive: true,
  emailVerifiedAt: '2026-01-01T00:00:00.000Z',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function apiPath(url: string): string {
  return new URL(url).pathname
}

async function fulfillJson(
  route: Route,
  body: unknown,
  status = 200,
): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function mockPendingDashboardApi(page: Page): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = apiPath(request.url())
    const method = request.method()

    if (method === 'GET' && path === '/api/auth/me') {
      await fulfillJson(route, currentUser)
      return
    }

    if (method === 'GET' && path === '/api/subscriptions/me') {
      await fulfillJson(route, pendingSubscription)
      return
    }

    if (method === 'GET' && path === '/api/plans/me') {
      await fulfillJson(route, [])
      return
    }

    if (
      method === 'GET' &&
      path === `/api/trainers/profiles/public/${pendingSubscription.trainerId}`
    ) {
      await fulfillJson(route, {
        id: pendingSubscription.trainerId,
        displayName: 'Ana López',
        bio: null,
        experienceYears: 5,
        monthlyPrice: 25000,
        specialties: [],
      })
      return
    }

    if (method === 'POST' && path === '/api/subscriptions/me/retry-checkout') {
      await fulfillJson(route, {
        subscriptionId: pendingSubscription.id,
        paymentId: 'pay-retry-1',
        preferenceId: 'pref-retry-1',
        checkoutUrl: '/payments/result/success?subscription_id=sub-pending-1',
      })
      return
    }

    await fulfillJson(route, { message: 'not mocked' }, 404)
  })
}

test.describe('subscription pending retry', () => {
  test('E5: pending subscription shows retry and completes checkout', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'e2e-jwt')
    })
    await mockPendingDashboardApi(page)
    await page.goto('/me')

    await expect(page.getByRole('alert')).toContainText(
      'El último pago fue rechazado',
    )
    await page.getByRole('button', { name: 'Reintentar pago' }).click()

    await expect(page).toHaveURL(/\/payments\/result\/success/)
    await expect(
      page.getByRole('heading', { name: 'Pago aprobado' }),
    ).toBeVisible()
  })
})
