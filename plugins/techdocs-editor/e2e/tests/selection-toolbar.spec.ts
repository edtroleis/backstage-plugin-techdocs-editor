import { expect, test } from '@playwright/test';
import { ORIGINAL, editor, expectLintClean, expectSaved, openEditor, selectBlockText, selectionToolbar } from './helpers';

/** Toolbar que aparece sobre o texto selecionado: aplicar e remover cada formatação. */

const paragraph = (page: Parameters<typeof editor>[0]) => editor(page).locator('p', { hasText: 'Texto inicial.' });
const withParagraph = (replacement: string) => ORIGINAL.replace('Texto inicial.', replacement);

test('aparece ao selecionar texto e some ao tirar a seleção', async ({ page }) => {
  await openEditor(page);
  await selectBlockText(page, paragraph(page));
  await expect(selectionToolbar(page)).toBeVisible();
  await page.keyboard.press('End');
  await expect(selectionToolbar(page)).toBeHidden();
});

const marks = [
  { label: 'Negrito', markdown: '**Texto inicial.**' },
  { label: 'Itálico', markdown: '*Texto inicial.*' },
  { label: 'Tachado', markdown: '~~Texto inicial.~~' },
  { label: 'Código no texto', markdown: '`Texto inicial.`' },
];
for (const { label, markdown } of marks) {
  test(`${label}: aplica e remove`, async ({ page }) => {
    await openEditor(page);
    await selectBlockText(page, paragraph(page));
    const button = selectionToolbar(page).getByRole('button', { name: label });
    await button.click();
    await expectSaved(page, withParagraph(markdown));
    await expectLintClean(page);

    await selectBlockText(page, editor(page).locator('p').first());
    await selectionToolbar(page).getByRole('button', { name: label }).click();
    await expectSaved(page, ORIGINAL);
  });
}

test('vários estilos juntos', async ({ page }) => {
  await openEditor(page);
  await selectBlockText(page, paragraph(page));
  await selectionToolbar(page).getByRole('button', { name: 'Negrito' }).click();
  await selectionToolbar(page).getByRole('button', { name: 'Itálico' }).click();
  await expectSaved(page, withParagraph('***Texto inicial.***'));
  await expectLintClean(page);
});

test('atalhos de teclado (Ctrl+B, Ctrl+I)', async ({ page }) => {
  await openEditor(page);
  await selectBlockText(page, paragraph(page));
  await page.keyboard.press('Control+b');
  await expectSaved(page, withParagraph('**Texto inicial.**'));
  await page.keyboard.press('Control+b');
  await page.keyboard.press('Control+i');
  await expectSaved(page, withParagraph('*Texto inicial.*'));
});

test('link: criar, editar o endereço e remover', async ({ page }) => {
  await openEditor(page);
  await selectBlockText(page, paragraph(page));
  await selectionToolbar(page).getByRole('button', { name: 'Link' }).click();
  const input = page.locator('.milkdown-link-edit input');
  await input.fill('https://exemplo.com');
  await input.press('Enter');
  await expectSaved(page, withParagraph('[Texto inicial.](https://exemplo.com)'));

  // Com o cursor no texto, passar o mouse sobre o link mostra o endereço e os botões de editar e remover
  await paragraph(page).click();
  await editor(page).locator('a').hover();
  const preview = page.locator('.milkdown-link-preview');
  await expect(preview).toBeVisible();
  await preview.locator('.link-edit-button').click();
  await expect(input).toBeVisible();
  await input.fill('https://outro.com');
  await input.press('Enter');
  await expectSaved(page, withParagraph('[Texto inicial.](https://outro.com)'));

  await paragraph(page).click();
  await editor(page).locator('a').hover();
  await expect(preview).toBeVisible();
  await preview.locator('.link-remove-button').click();
  await expectSaved(page, ORIGINAL);
});
