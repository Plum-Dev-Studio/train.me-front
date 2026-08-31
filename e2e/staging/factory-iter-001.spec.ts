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

/** After reset:intake staging, client@seed.local may hit the intake gate first. */
async function dismissIntakeGateIfPresent(
  page: import('@playwright/test').Page,
) {
  const gate = page.getByText('Completá tu cuestionario')
  if (!(await gate.isVisible({ timeout: 3_000 }).catch(() => false))) return
  await page.getByLabel(/Objetivo/).fill(`QA bypass ${Date.now()}`)
  await page.getByLabel(/Edad/).fill('30')
  await page.getByRole('button', { name: 'Enviar respuestas' }).click()
  await expect(page.getByRole('heading', { name: 'Suscripción' })).toBeVisible({
    timeout: 15_000,
  })
}

test.describe('@staging factory iter-001 manual QA', () => {
  test.use({ baseURL: STAGING_FRONT })

  test('W1 plan editor v2 — block rounds', async ({ page }) => {
    const tplName = `QA Template ${Date.now()}`
    const blockName = `Pecho QA ${Date.now()}`

    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto('/app/plantillas')

    await page.locator('#template-name').fill(tplName)
    await page.getByRole('button', { name: 'Crear plantilla' }).click()
    await expect(page).toHaveURL(/\/app\/plantillas\//, { timeout: 20_000 })

    await page.getByRole('button', { name: 'Agregar rutina' }).click()
    await page.getByRole('button', { name: 'Agregar bloque' }).first().click()

    await page
      .getByRole('textbox', { name: /Nombre del bloque/i })
      .fill(blockName)
    await page.getByRole('spinbutton', { name: /Rounds del bloque/i }).fill('3')
    await page
      .getByRole('spinbutton', { name: /Descanso entre rounds/i })
      .fill('60')
    await page.getByRole('button', { name: 'Crear bloque' }).click()

    await expect(page.getByText(blockName)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/3 rounds/)).toBeVisible()
  })

  test('W2 exercise CRUD — create custom exercise', async ({ page }) => {
    const name = `QA Lift ${Date.now()}`

    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto('/app/ejercicios')

    await page.locator('#exercise-name').fill(name)
    await page.getByRole('button', { name: 'Agregar ejercicio' }).click()

    await expect(page.getByText(name)).toBeVisible({ timeout: 15_000 })
  })

  test('W3 client notes + plans panel', async ({ page }) => {
    const note = `QA note ${Date.now()}`

    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto('/app/clientes')

    await page.getByRole('button', { name: USER_EMAIL }).click()
    await expect(
      page.getByRole('heading', { name: 'Notas del entrenador' }),
    ).toBeVisible({ timeout: 15_000 })
    await expect(
      page.getByRole('heading', { name: 'Planes del cliente' }),
    ).toBeVisible()

    await page.getByLabel(/Notas privadas/i).fill(note)
    await page.getByRole('button', { name: 'Guardar notas' }).click()
    await expect(page.getByText(/guardadas/i)).toBeVisible({ timeout: 15_000 })
  })

  test('W5 nutrition tab on /me', async ({ page }) => {
    await loginAs(page, USER_EMAIL, PASSWORD, /\/me/)
    await dismissIntakeGateIfPresent(page)
    await page.getByRole('button', { name: 'Ver nutrición' }).click()
    // Seed plan may lack nutrition payload — tab + empty state still validates BL-060/061 UI.
    const empty = page.getByText('Todavía no hay guía de nutrición en tu plan.')
    const dayTab = page.getByRole('button', { name: 'Día' })
    await expect(empty.or(dayTab)).toBeVisible({ timeout: 15_000 })
    if (await dayTab.isVisible()) {
      await expect(page.getByRole('button', { name: 'Semana' })).toBeVisible()
    }
  })

  test('W6 register trainer API', async ({ request }) => {
    const nosub = process.env.STAGING_QA_NOSUB_EMAIL ?? 'qa.nosub@seed.local'
    const loginRes = await request.post(`${STAGING_API}/auth/login`, {
      data: { email: nosub, password: PASSWORD },
    })
    expect(loginRes.ok()).toBeTruthy()
    const { accessToken } = (await loginRes.json()) as { accessToken: string }

    const regRes = await request.post(
      `${STAGING_API}/trainers/profiles/me/register`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    expect(regRes.status()).toBeLessThan(500)
    expect([200, 201, 409]).toContain(regRes.status())
  })
})
