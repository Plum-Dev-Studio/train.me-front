import { defineConfig, devices } from '@playwright/test'

const stagingFront =
  process.env.STAGING_FRONT_URL ??
  'https://trainme-front-staging.up.railway.app'

export default defineConfig({
  testDir: './e2e/staging',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 120_000,
  use: {
    baseURL: stagingFront,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})
