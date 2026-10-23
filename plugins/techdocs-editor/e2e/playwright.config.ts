import { defineConfig, devices } from '@playwright/test';

/**
 * Testes do editor visual no navegador, contra a página de teste (harness/), sem Backstage nem
 * GitHub. Rodar da raiz do backstage: `yarn test:editor`.
 */
const port = Number(process.env.EDITOR_HARNESS_PORT ?? 4319);

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '../../../node_modules/.cache/editor-test-report' }]],
  outputDir: '../../../node_modules/.cache/editor-test-results',
  use: {
    baseURL: `http://localhost:${port}`,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command: 'node harness/build.mjs --serve',
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
