import { delimiter, join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Testes do editor dentro do portal (página do editor, painel, botões), com o GitHub simulado
 * (fake-github.ts), contra a app de desenvolvimento do repositório. Da raiz: `yarn test:editor:portal`.
 * Sobe a app sozinho (`yarn start`) se ela ainda não estiver rodando; o TechDocs gera a wiki de
 * exemplo com o `mkdocs` do PATH ou do .venv da raiz (`pip install -r requirements-docs.txt`).
 */
const root = join(__dirname, '../../../..');
const portalUrl = process.env.PORTAL_URL ?? 'http://localhost:3000';

export default defineConfig({
  testDir: '.',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  // O servidor de desenvolvimento do Backstage é um só: poucos testes ao mesmo tempo
  workers: 3,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never', outputFolder: join(root, 'node_modules/.cache/editor-portal-report') }]],
  outputDir: join(root, 'node_modules/.cache/editor-portal-results'),
  use: {
    baseURL: portalUrl,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
  },
  webServer: process.env.PORTAL_URL
    ? undefined
    : {
        command: 'yarn start',
        cwd: root,
        url: portalUrl,
        reuseExistingServer: !process.env.CI,
        timeout: 300_000,
        env: { PATH: [join(root, '.venv/bin'), process.env.PATH].join(delimiter) },
      },
});
