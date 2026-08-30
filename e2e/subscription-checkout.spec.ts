import { test, expect, type Page, type Route } from '@playwright/test'

const TRAINER_ID = 'trainer-e2e-1'

const trainerProfile = {
  id: TRAINER_ID,
  displayName: 'Ana López',
  bio: 'Fuerza y movilidad.',
  experienceYears: 5,
  monthlyPrice: 25000,
  specialties: ['Fuerza'],
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

async function mockApi(
  page: Page,
  options: { checkoutStatus?: number } = {},
): Promise<void> {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const path = apiPath(request.url())
    const method = request.method()

    if (
      method === 'GET' &&
      path === `/api/trainers/profiles/public/${TRAINER_ID}`
    ) {
      await fulfillJson(route, trainerProfile)
      return
    }

    if (method === 'GET' && path === '/api/auth/me') {
      await fulfillJson(route, currentUser)
      return
    }

    if (method === 'POST' && path === '/api/subscriptions/checkout') {
      if (options.checkoutStatus === 400) {
        await fulfillJson(
          route,
          { message: 'MercadoPago account is not connected' },
          400,
        )
        return
      }
      await fulfillJson(route, {
        subscriptionId: 'sub-1',
        paymentId: 'pay-1',
        preferenceId: 'pref-1',
        checkoutUrl: '/payments/result/success?subscription_id=sub-1',
      })
      return
    }

    if (method === 'GET' && path === '/api/subscriptions/sub-1') {
      await fulfillJson(route, {
        id: 'sub-1',
        userId: currentUser.id,
        trainerId: TRAINER_ID,
        planType: 'monthly',
        status: 'pending',
        startDate: null,
        endDate: null,
        canceledAt: null,
      })
      return
    }

    await fulfillJson(route, { message: 'not mocked' }, 404)
  })
}

test.describe('subscription checkout', () => {
  test('E1: without JWT, Suscribirme goes to /login', async ({ page }) => {
    await mockApi(page)
    await page.goto(`/entrenadores/${TRAINER_ID}`)
    await expect(page.getByRole('heading', { name: 'Ana López' })).toBeVisible()

    await page.getByRole('button', { name: 'Suscribirme' }).click()

    await expect(page).toHaveURL(/\/login$/)
    await expect(
      page.getByRole('heading', { name: 'Entrá a train.me' }),
    ).toBeVisible()
  })

  test('E2: JWT + mock checkout 200 lands on Pago aprobado', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'e2e-jwt')
    })
    await mockApi(page)
    await page.goto(`/entrenadores/${TRAINER_ID}`)
    await expect(page.getByRole('heading', { name: 'Ana López' })).toBeVisible()

    await page.getByRole('button', { name: 'Suscribirme' }).click()

    await expect(page).toHaveURL(/\/payments\/result\/success/)
    await expect(
      page.getByRole('heading', { name: 'Pago aprobado' }),
    ).toBeVisible()
  })

  test('E3: mock 400 MP not connected shows cobros copy', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('auth_token', 'e2e-jwt')
    })
    await mockApi(page, { checkoutStatus: 400 })
    await page.goto(`/entrenadores/${TRAINER_ID}`)
    await expect(page.getByRole('heading', { name: 'Ana López' })).toBeVisible()

    await page.getByRole('button', { name: 'Suscribirme' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'Este entrenador todavía no tiene habilitados los cobros en Mercado Pago.',
    )
  })
})
