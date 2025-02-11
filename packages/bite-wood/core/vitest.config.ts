import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    setupFiles: 'vitest.setup.ts',
    // environment: 'jsdom',

    browser: {
      provider: 'playwright',
      enabled: true,
      instances: [{ browser: 'chromium' }],
      headless: true,
      screenshotFailures: false,
    },
  },
})
