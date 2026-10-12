import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const isRemote = baseURL.startsWith('https://') || (baseURL.startsWith('http://') && !baseURL.includes('localhost') && !baseURL.includes('127.0.0.1'));

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'e2e-report.json' }]],
  use: {
    baseURL,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 }
      },
    },
    {
      name: 'mobile-chromium',
      use: { 
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 }
      },
    },
  ],
  webServer: isRemote ? undefined : {
    command: 'pnpm --filter @cinevault/web start -p 3000',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
