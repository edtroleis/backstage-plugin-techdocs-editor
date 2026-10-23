import { join } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

/**
 * Vídeos curtos do README (docs/media/*.gif): o editor dentro da app de desenvolvimento, com o
 * GitHub simulado dos testes do portal. Da raiz: `yarn record:videos` (sobe a app se precisar,
 * grava e converte com o ffmpeg).
 */
const root = join(__dirname, '../../../..');

export default defineConfig({
  testDir: '.',
  timeout: 180_000,
  expect: { timeout: 30_000 },
  workers: 1,
  reporter: 'list',
  outputDir: join(root, 'node_modules/.cache/editor-videos-results'),
  use: {
    baseURL: process.env.PORTAL_URL ?? 'http://localhost:3000',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 760 },
    video: { mode: 'on', size: { width: 1280, height: 760 } },
  },
});
