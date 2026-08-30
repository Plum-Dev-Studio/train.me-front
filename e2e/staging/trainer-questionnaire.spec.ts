import { test, expect } from '@playwright/test'

const STAGING_FRONT =
  process.env.STAGING_FRONT_URL ??
  'https://trainme-front-staging.up.railway.app'
const STAGING_API =
  process.env.STAGING_API_URL ??
  'https://trainme-production-staging.up.railway.app'

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

test.describe('@staging US-1.5 trainer questionnaire', () => {
  test.use({ baseURL: STAGING_FRONT })

  test('M1–M4 trainer configures questionnaire and student completes', async ({
    page,
    request,
  }) => {
    const uniqueGoal = `Staging goal ${Date.now()}`

    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto('/app/configuracion')
    await expect(
      page.getByRole('heading', { name: 'Cuestionario post-suscripción' }),
    ).toBeVisible()

    await page
      .getByRole('button', { name: 'Cargar plantilla sugerida' })
      .click()
    await page.getByRole('button', { name: 'Guardar cuestionario' }).click()
    await expect(page.getByText('Cuestionario guardado.')).toBeVisible({
      timeout: 15_000,
    })

    const trainerToken = await page.evaluate(() =>
      localStorage.getItem('auth_token'),
    )
    const meRes = await request.get(`${STAGING_API}/auth/me`, {
      headers: { Authorization: `Bearer ${trainerToken}` },
    })
    const me = (await meRes.json()) as { id: string }
    const profileRes = await request.get(
      `${STAGING_API}/trainers/profiles/${me.id}`,
      { headers: { Authorization: `Bearer ${trainerToken}` } },
    )
    const profile = (await profileRes.json()) as { id: string }

    await loginAs(page, USER_EMAIL, PASSWORD, /\/me/)
    await expect(page.getByText('Completá tu cuestionario')).toBeVisible({
      timeout: 15_000,
    })

    await page.getByLabel(/Objetivo/).fill(uniqueGoal)
    await page.getByLabel(/Edad/).fill('30')
    await page.getByRole('button', { name: 'Enviar respuestas' }).click()
    await expect(page.getByText(/respuestas fueron enviadas/i)).toBeVisible({
      timeout: 15_000,
    })

    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto('/app/clientes')
    await page.getByRole('button', { name: USER_EMAIL }).click()
    await expect(page.getByText(uniqueGoal)).toBeVisible({ timeout: 15_000 })

    void profile
  })
})
