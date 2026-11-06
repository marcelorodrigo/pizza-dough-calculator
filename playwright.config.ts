import { fileURLToPath } from 'node:url'
import { defineConfig, devices } from '@playwright/test'
import type { ConfigOptions } from '@nuxt/test-utils/playwright'

export default defineConfig<ConfigOptions>({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    // The static preset has no .output/server entry. Target the `serve`
    // process started by webServer instead of letting Nuxt build/start one.
    nuxt: {
      rootDir: fileURLToPath(new URL('.', import.meta.url)),
      host: 'http://localhost:4173'
    }
  },
  webServer: {
    command: 'pnpm generate && pnpm preview',
    url: 'http://localhost:4173',
    reuseExistingServer: false,
    timeout: 180_000
  }
})
