import { test, expect } from '@playwright/test'

const STAGING_FRONT =
  process.env.STAGING_FRONT_URL ??
  'https://trainme-front-staging.up.railway.app'

const TRAINER_EMAIL =
  process.env.STAGING_QA_TRAINER_EMAIL ?? 'trainer@seed.local'
const USER_EMAIL = process.env.STAGING_QA_USER_EMAIL ?? 'client@seed.local'
const PASSWORD = process.env.STAGING_QA_PASSWORD ?? 'Seed123!'

async function loginAs(
  page: import('@playwright/test').Page,
  email: string,
  password: string,
  expectedPath: RegExp,
) {
  await page.goto('/login')
  await page.evaluate(() => localStorage.removeItem('auth_token'))
  await page.reload()
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByLabel('Contraseña').fill(password)
  await page.getByRole('button', { name: /iniciar sesión/i }).click()
  await expect(page).toHaveURL(expectedPath, { timeout: 20_000 })
}

test.describe('@staging BL-094 staging smoke', () => {
  test.use({ baseURL: STAGING_FRONT })

  test('trainer seed login loads /app', async ({ page }) => {
    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await expect(page.getByRole('heading', { name: /Buen día/i })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('user seed login loads /me', async ({ page }) => {
    await loginAs(page, USER_EMAIL, PASSWORD, /\/me/)
    await expect(page.getByRole('heading', { name: 'Tu panel' })).toBeVisible({
      timeout: 15_000,
    })
  })

  test('public trainers list loads', async ({ page }) => {
    await page.goto('/entrenadores')
    await expect(
      page.getByRole('heading', { name: 'Encontrá tu entrenador ideal' }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: 'Ver perfil y suscribirme' }).first(),
    ).toBeVisible({ timeout: 15_000 })
  })
})
