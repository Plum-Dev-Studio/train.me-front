import { test, expect } from '@playwright/test'

const STAGING_FRONT =
  process.env.STAGING_FRONT_URL ??
  'https://trainme-front-staging.up.railway.app'
const STAGING_API =
  process.env.STAGING_API_URL ??
  'https://trainme-production-staging.up.railway.app'

const TRAINER_EMAIL =
  process.env.STAGING_QA_TRAINER_EMAIL ?? 'trainer@seed.local'
const TRAINER_PASSWORD = process.env.STAGING_QA_PASSWORD ?? 'Seed123!'
const USER_EMAIL = process.env.STAGING_QA_USER_EMAIL ?? 'client@seed.local'
const USER_PASSWORD = process.env.STAGING_QA_PASSWORD ?? 'Seed123!'

const CONTACT = {
  whatsapp: '5491123456789',
  email: 'coach-contact-staging@test.local',
  instagram: '@coachstaging',
  instagramNormalized: 'coachstaging',
}

test.describe('@staging US-1.6 trainer contact channels', () => {
  test.use({ baseURL: STAGING_FRONT })

  test('M1–M5 contact channels on settings, public profile, and /me', async ({
    page,
    request,
  }) => {
    // --- M1: trainer saves contact fields in settings ---
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(TRAINER_EMAIL)
    await page.getByLabel(/contraseña/i).fill(TRAINER_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 })

    await page.goto('/app/configuracion')
    await expect(
      page.getByRole('heading', { name: 'Canales de contacto' }),
    ).toBeVisible()

    await page.getByPlaceholder('54911…').fill(CONTACT.whatsapp)
    await page.getByPlaceholder('coach@…').fill(CONTACT.email)
    await page.getByPlaceholder('miusuario').fill(CONTACT.instagram)
    await page.getByRole('button', { name: 'Guardar contacto' }).click()
    await expect(
      page.getByText(/Perfil actualizado correctamente/i),
    ).toBeVisible({
      timeout: 15_000,
    })

    await page.reload()
    await expect(page.getByPlaceholder('54911…')).toHaveValue(CONTACT.whatsapp)
    await expect(page.getByPlaceholder('coach@…')).toHaveValue(CONTACT.email)
    await expect(page.getByPlaceholder('miusuario')).toHaveValue(
      CONTACT.instagramNormalized,
    )

    // Resolve trainer profile id via API
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
    const profile = (await profileRes.json()) as {
      id: string
      contactWhatsapp: string | null
      contactInstagram: string | null
    }
    expect(profile.contactWhatsapp).toBe(CONTACT.whatsapp)
    expect(profile.contactInstagram).toBe(CONTACT.instagramNormalized)

    const trainerProfileId = profile.id

    // --- M2: public profile shows links ---
    await page.goto(`/entrenadores/${trainerProfileId}`)
    const waLink = page.getByRole('link', { name: 'WhatsApp' })
    await expect(waLink).toBeVisible()
    await expect(waLink).toHaveAttribute(
      'href',
      expect.stringContaining(`wa.me/${CONTACT.whatsapp}`),
    )
    await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      `mailto:${CONTACT.email}`,
    )
    await expect(page.getByRole('link', { name: 'Instagram' })).toHaveAttribute(
      'href',
      `https://instagram.com/${CONTACT.instagramNormalized}`,
    )

    // --- M3: student /me shows contact section with WA prefilled ---
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(USER_EMAIL)
    await page.getByLabel(/contraseña/i).fill(USER_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/me/, { timeout: 20_000 })

    await expect(page.getByText('Contactar entrenador')).toBeVisible()
    const studentWa = page.getByRole('link', { name: 'WhatsApp' })
    await expect(studentWa).toBeVisible()
    await expect(studentWa).toHaveAttribute(
      'href',
      expect.stringContaining('text=Hola'),
    )

    // --- M4 + M5: clear contacts; IG @ stripped on save (verified in M1 reload) ---
    await page.goto('/login')
    await page.getByLabel(/email/i).fill(TRAINER_EMAIL)
    await page.getByLabel(/contraseña/i).fill(TRAINER_PASSWORD)
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page).toHaveURL(/\/app/, { timeout: 20_000 })

    await page.goto('/app/configuracion')
    await page.getByPlaceholder('54911…').fill('')
    await page.getByPlaceholder('coach@…').fill('')
    await page.getByPlaceholder('miusuario').fill('')
    await page.getByRole('button', { name: 'Guardar contacto' }).click()
    await expect(
      page.getByText(/Perfil actualizado correctamente/i),
    ).toBeVisible()

    await page.goto(`/entrenadores/${trainerProfileId}`)
    await expect(page.getByRole('link', { name: 'WhatsApp' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Email' })).toHaveCount(0)
    await expect(page.getByRole('link', { name: 'Instagram' })).toHaveCount(0)
  })
})
