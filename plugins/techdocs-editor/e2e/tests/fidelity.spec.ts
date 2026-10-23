import { expect, test } from '@playwright/test';
import { editor, expectLintClean, expectSaved, openEditor, saved } from './helpers';

/** O editor não pode estragar o que já existe no arquivo, nem a sintaxe do MkDocs. */

const WIKI_PAGE = `# Primeiros passos

Bem-vindo à wiki.

!!! tip "Dica"
    Use o botão **Editar esta página**.

    Segundo parágrafo da dica.

=== "Linux"

    \`\`\`bash
    ./instalar.sh
    \`\`\`

=== "Windows"

    Rode o instalador.

| Coluna | Outra |
| ------ | ----- |
| a      | b     |

- um
- dois

1. primeiro
2. segundo

\`\`\`yaml
chave: valor
\`\`\`

---

Fim com [outra página](outra.md) e ![imagem](assets/foto.png).
`;

test('abrir não avisa mudança (o editor normaliza o texto ao carregar)', async ({ page }) => {
  const { errors } = await openEditor(page, WIKI_PAGE);
  await page.waitForTimeout(1000);
  expect(await page.evaluate(() => window.harness.changes)).toBe(0);
  expect(errors).toEqual([]);
});

test('editar um trecho não muda o resto do arquivo', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  await editor(page).locator('p', { hasText: 'Bem-vindo' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' Olá!');
  await expectSaved(page, WIKI_PAGE.replace('Bem-vindo à wiki.', 'Bem-vindo à wiki. Olá!'));
});

test('editar e voltar ao texto original avisa a volta (não salva a versão intermediária)', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  await editor(page).locator('p', { hasText: 'Bem-vindo' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type('X');
  await expectSaved(page, WIKI_PAGE.replace('wiki.', 'wiki.X'));
  await page.keyboard.press('Backspace');
  await expectSaved(page, WIKI_PAGE);
});

test('admonition e abas aparecem como bloco protegido e voltam iguais', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  const raw = page.locator('.milkdown-code-block', { hasText: '!!! tip' });
  await expect(raw).toHaveCount(1);
  await expect(page.locator('.milkdown-code-block', { hasText: '=== "Linux"' })).toHaveCount(1);
  // Editar dentro do admonition
  await raw.locator('.cm-line', { hasText: 'Segundo parágrafo' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type(' Editado.');
  await expectSaved(page, WIKI_PAGE.replace('Segundo parágrafo da dica.', 'Segundo parágrafo da dica. Editado.'));
});

test('remover um admonition', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  const raw = page.locator('.milkdown-code-block', { hasText: '!!! tip' });
  await raw.locator('.cm-content').click();
  await page.keyboard.press('Control+a');
  await page.keyboard.press('Backspace');
  await page.keyboard.press('Backspace');
  await expect(raw).toHaveCount(0);
  await expect.poll(() => saved(page)).toBeDefined();
  const result = await saved(page);
  expect(result).not.toContain('!!! tip');
  expect(result).not.toContain('```mkdocs');
  expect(result).toContain('=== "Linux"');
});

test('o arquivo de exemplo passa no lint depois de editado', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  await editor(page).locator('p', { hasText: 'Bem-vindo' }).click();
  await page.keyboard.press('End');
  await page.keyboard.type('!');
  await expectSaved(page, WIKI_PAGE.replace('wiki.', 'wiki.!'));
  await expectLintClean(page);
});

test('busca no modo visual: conta, navega e limpa', async ({ page }) => {
  await openEditor(page, '# Página\n\nGato e gato.\n\nOutro GATO.\n');
  const result = await page.evaluate(() => window.harness.editor!.search('gato'));
  expect(result).toEqual({ current: 1, total: 3 });
  await expect(page.locator('.docs-search-current')).toHaveCount(1);
  await expect(page.locator('.docs-search-match')).toHaveCount(2);
  expect(await page.evaluate(() => window.harness.editor!.moveSearch(1))).toEqual({ current: 2, total: 3 });
  expect(await page.evaluate(() => window.harness.editor!.moveSearch(-1))).toEqual({ current: 1, total: 3 });
  expect(await page.evaluate(() => window.harness.editor!.moveSearch(-1))).toEqual({ current: 3, total: 3 });
  expect(await page.evaluate(() => window.harness.editor!.search(''))).toEqual({ current: 0, total: 0 });
  await expect(page.locator('.docs-search-match, .docs-search-current')).toHaveCount(0);
});

test('números de linha ao lado dos blocos batem com o arquivo', async ({ page }) => {
  await openEditor(page, WIKI_PAGE);
  // Os números ficam ao lado do editor, no mesmo contêiner
  const lines = page.locator('.milkdown').locator('xpath=../..').locator('> span');
  await expect(lines.first()).toHaveText('1');
  const numbers = (await lines.allTextContents()).map(t => t.replace(/\D/g, ''));
  // Título (1), parágrafo (3), admonition (5), abas (10 e 16), tabela (20)...
  expect(numbers.slice(0, 6)).toEqual(['1', '3', '5', '10', '16', '20']);
});
