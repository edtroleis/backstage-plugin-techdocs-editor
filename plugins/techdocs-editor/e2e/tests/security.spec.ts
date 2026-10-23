import { expect, test } from '@playwright/test';
import { editor, openEditor, saved } from './helpers';

/**
 * Conteúdo hostil numa página (o Markdown das wikis aceita HTML): o editor mostra, mas nada executa,
 * e o arquivo volta igual ao salvar.
 */
const HOSTILE = [
  '# Página',
  '',
  'Texto <img src="x" onerror="window.__xss = \'img\'"> no meio.',
  '',
  '<script>window.__xss = "script"</script>',
  '',
  '<iframe src="javascript:window.__xss = \'iframe\'"></iframe>',
  '',
  '[clique aqui](javascript:window.__xss=\'link\')',
  '',
].join('\n');

test('HTML e links javascript: numa página não executam no editor', async ({ page }) => {
  const dialogs: string[] = [];
  page.on('dialog', d => {
    dialogs.push(d.message());
    return d.dismiss();
  });
  await openEditor(page, HOSTILE);
  await page.waitForTimeout(500);

  expect(await page.evaluate(() => (window as unknown as { __xss?: string }).__xss)).toBeUndefined();
  // A página foi renderizada (o teste não passa por o editor estar vazio)…
  await expect(editor(page)).toContainText('no meio');
  await expect(editor(page).getByText('clique aqui')).toBeVisible();
  // …e o HTML aparece como texto, não como elemento
  await expect(editor(page).locator('img[src="x"], script, iframe')).toHaveCount(0);

  // Clicar no link não navega nem executa (o editor é editável; links não seguem)
  await editor(page).getByText('clique aqui').click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => (window as unknown as { __xss?: string }).__xss)).toBeUndefined();
  expect(dialogs).toEqual([]);

  // Sem edição, nada muda no arquivo
  expect(await saved(page)).toBeUndefined();
});
