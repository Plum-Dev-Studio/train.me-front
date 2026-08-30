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

test.describe('@staging US-2.2 trainer reviews', () => {
  test.use({ baseURL: STAGING_FRONT })

  test('M1–M4 public reviews list, student upsert, trainer blocked', async ({
    page,
    request,
  }) => {
    const uniqueComment = `Staging review ${Date.now()}`

    // Resolve trainer public profile id from seed trainer
    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    const trainerToken = await page.evaluate(() =>
      localStorage.getItem('auth_token'),
    )
    expect(trainerToken).toBeTruthy()

    const meRes = await request.get(`${STAGING_API}/auth/me`, {
      headers: { Authorization: `Bearer ${trainerToken}` },
    })
    expect(meRes.ok()).toBeTruthy()
    const me = (await meRes.json()) as { id: string }
    const profileRes = await request.get(
      `${STAGING_API}/trainers/profiles/${me.id}`,
      { headers: { Authorization: `Bearer ${trainerToken}` } },
    )
    expect(profileRes.ok()).toBeTruthy()
    const profile = (await profileRes.json()) as { id: string }
    const trainerProfileId = profile.id

    // --- M1: public profile shows reviews section ---
    await page.goto(`/entrenadores/${trainerProfileId}`)
    await expect(page.getByRole('heading', { name: 'Reseñas' })).toBeVisible()

    // --- M2: student with subscription can publish a review ---
    await loginAs(page, USER_EMAIL, PASSWORD, /\/me/)
    await page.goto(`/entrenadores/${trainerProfileId}`)
    await expect(page.getByText('Dejá tu reseña')).toBeVisible()

    await page.getByLabel('Puntuación').selectOption('4')
    await page.getByLabel('Comentario (opcional)').fill(uniqueComment)
    await page.getByRole('button', { name: 'Publicar reseña' }).click()
    await expect(page.getByText('Reseña guardada.')).toBeVisible({
      timeout: 15_000,
    })
    await expect(
      page.getByRole('article').filter({ hasText: uniqueComment }),
    ).toBeVisible()

    // --- M3: average rating visible in header after publish ---
    await expect(page.getByText(/^\d\.\d/)).toBeVisible()
    await expect(page.getByText(/reseña/i)).toBeVisible()

    // --- M4: trainer cannot review (403 surfaced in UI) ---
    await loginAs(page, TRAINER_EMAIL, PASSWORD, /\/app/)
    await page.goto(`/entrenadores/${trainerProfileId}`)
    await expect(page.getByText('Dejá tu reseña')).toHaveCount(0)
  })
})
