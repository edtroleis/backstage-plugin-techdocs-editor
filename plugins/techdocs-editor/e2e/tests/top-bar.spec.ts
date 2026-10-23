import { expect, test } from '@playwright/test';
import {
  ORIGINAL,
  chooseHeading,
  clickTopBar,
  editor,
  expectSavable,
  expectLintClean,
  expectSaved,
  expectSavedMatch,
  newLineAtEnd,
  openEditor,
  selectBlockText,
  topBarButton,
} from './helpers';

/** Cada botão da barra fixa: aplicar, conferir o Markdown salvo e desfazer pelo mesmo botão. */

const paragraph = (page: Parameters<typeof editor>[0]) => editor(page).locator('p', { hasText: 'Texto inicial.' });
const withParagraph = (replacement: string) => ORIGINAL.replace('Texto inicial.', replacement);

test('todos os botões têm nome (dica ao passar o mouse e leitor de tela)', async ({ page }) => {
  await openEditor(page);
  const names = await page.locator('.top-bar-item').evaluateAll(buttons => buttons.map(b => b.getAttribute('aria-label')));
  expect(names.every(Boolean), names.join(', ')).toBe(true);
  await expect(topBarButton(page, 'bold')).toHaveAttribute('title', /Negrito/);
  await expect(topBarButton(page, 'redo')).toHaveAttribute('title', /Refazer/);
});

test.describe('barra: título', () => {
  for (const level of [1, 2, 3, 4, 5, 6]) {
    test(`Título ${level} e volta a Parágrafo`, async ({ page }) => {
      await openEditor(page);
      await paragraph(page).click();
      await chooseHeading(page, `Título ${level}`);
      await expectSaved(page, withParagraph(`${'#'.repeat(level)} Texto inicial.`));
      await expect(page.locator('.top-bar-heading-label')).toHaveText(`Título ${level}`);
      await expectSavable(page);

      await chooseHeading(page, 'Parágrafo');
      await expectSaved(page, ORIGINAL);
      await expect(page.locator('.top-bar-heading-label')).toHaveText('Parágrafo');
    });
  }
});

test.describe('barra: formatação do texto selecionado', () => {
  const marks = [
    { button: 'bold', markdown: '**Texto inicial.**' },
    { button: 'italic', markdown: '*Texto inicial.*' },
    { button: 'strikethrough', markdown: '~~Texto inicial.~~' },
    { button: 'inlineCode', markdown: '`Texto inicial.`' },
  ] as const;
  for (const { button, markdown } of marks) {
    test(`${button}: aplica e remove`, async ({ page }) => {
      await openEditor(page);
      await selectBlockText(page, paragraph(page));
      await clickTopBar(page, button);
      await expectSaved(page, withParagraph(markdown));
      await expect(topBarButton(page, button)).toHaveClass(/active/);
      await expectLintClean(page);

      await clickTopBar(page, button);
      await expectSaved(page, ORIGINAL);
    });
  }

  test('bold sem seleção vale para o que for digitado', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' ');
    await clickTopBar(page, 'bold');
    await page.keyboard.type('forte');
    await clickTopBar(page, 'bold');
    await page.keyboard.type(' fim');
    await expectSaved(page, withParagraph('Texto inicial. **forte** fim'));
  });

  test('inline code sem seleção vale para o que for digitado', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' ');
    await clickTopBar(page, 'inlineCode');
    await expect(topBarButton(page, 'inlineCode')).toHaveClass(/active/);
    await page.keyboard.type('npm');
    await clickTopBar(page, 'inlineCode');
    await page.keyboard.type(' fim');
    await expectSaved(page, withParagraph('Texto inicial. `npm` fim'));
  });
});

test.describe('barra: listas', () => {
  const lists = [
    { button: 'bulletList', marker: '- ' },
    { button: 'orderedList', marker: '1. ' },
    { button: 'taskList', marker: '- [ ] ' },
  ] as const;
  for (const { button, marker } of lists) {
    test(`${button}: aplica e o mesmo botão remove`, async ({ page }) => {
      await openEditor(page);
      await paragraph(page).click();
      await clickTopBar(page, button);
      await expectSaved(page, withParagraph(`${marker}Texto inicial.`));
      await expect(topBarButton(page, button)).toHaveClass(/active/);
      await expectLintClean(page);

      await clickTopBar(page, button);
      await expectSaved(page, ORIGINAL);
      await expect(topBarButton(page, button)).not.toHaveClass(/active/);
    });
  }

  test('troca o tipo da lista', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await clickTopBar(page, 'bulletList');
    await expectSaved(page, withParagraph('- Texto inicial.'));
    await clickTopBar(page, 'orderedList');
    await expectSaved(page, withParagraph('1. Texto inicial.'));
    await clickTopBar(page, 'taskList');
    await expectSaved(page, withParagraph('- [ ] Texto inicial.'));
    await clickTopBar(page, 'bulletList');
    await expectSaved(page, withParagraph('- Texto inicial.'));
  });

  test('marcar a tarefa como feita', async ({ page }) => {
    await openEditor(page, '# Página\n\n- [ ] Tarefa\n');
    // A caixa de seleção é o marcador à esquerda do item
    await editor(page).locator('li .label-wrapper, li [class*="label"]').first().click();
    await expectSaved(page, '# Página\n\n- [x] Tarefa\n');
  });
});

test.describe('barra: inserir', () => {
  test('link no texto selecionado e remover', async ({ page }) => {
    await openEditor(page);
    await selectBlockText(page, paragraph(page));
    await clickTopBar(page, 'link');
    const input = page.locator('.milkdown-link-edit input');
    await expect(input).toBeVisible();
    await input.fill('https://exemplo.com');
    await input.press('Enter');
    await expectSaved(page, withParagraph('[Texto inicial.](https://exemplo.com)'));
    await expectLintClean(page);

    // Remover: com o texto do link selecionado, o mesmo botão tira o link
    await selectBlockText(page, paragraph(page));
    await clickTopBar(page, 'link');
    await expectSaved(page, ORIGINAL);
  });

  test('imagem', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await clickTopBar(page, 'image');
    await expect(page.locator('.milkdown-image-block')).toHaveCount(1);
    // Bloco deixado vazio não vai para o arquivo
    await expectSaved(page, ORIGINAL);
  });

  test('tabela: insere e o mesmo botão remove', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await clickTopBar(page, 'table');
    await expect(page.locator('.milkdown-table-block')).toHaveCount(1);
    await page.locator('.milkdown-table-block th').first().click();
    await page.keyboard.type('A');
    await expectSavedMatch(page, /\| A +\|/);
    await expectLintClean(page);

    await clickTopBar(page, 'table');
    await expect(page.locator('.milkdown-table-block')).toHaveCount(0);
    await expectSaved(page, ORIGINAL);
  });

  test('tabela: adicionar linha e coluna pelos botões +', async ({ page }) => {
    await openEditor(page, '# Página\n\n| A | B |\n| - | - |\n| 1 | 2 |\n');
    const table = page.locator('.milkdown-table-block');
    // O "+" aparece na borda da célula sob o mouse; o mouse vai até ele sem passar por outras células
    const clickPlus = async (role: string, edge: 'bottom' | 'right') => {
      const cell = (await table.locator('td').last().boundingBox())!;
      await page.mouse.move(
        edge === 'right' ? cell.x + cell.width - 2 : cell.x + cell.width / 2,
        edge === 'bottom' ? cell.y + cell.height - 2 : cell.y + cell.height / 2,
      );
      const plus = table.locator(`[data-role="${role}"] button`);
      await expect(plus).toBeVisible();
      const box = (await plus.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 5 });
      await page.mouse.down();
      await page.mouse.up();
    };
    await clickPlus('x-line-drag-handle', 'bottom');
    await expect(table.locator('tr')).toHaveCount(3);
    await clickPlus('y-line-drag-handle', 'right');
    await expect(table.locator('tr').first().locator('th')).toHaveCount(3);
    await expectSavedMatch(page, /^# Página\n\n\| A +\| B +\| +\|\n/);
    await expectLintClean(page);
  });
});

test.describe('barra: blocos', () => {
  test('bloco de código: transforma o parágrafo e volta', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await clickTopBar(page, 'codeBlock');
    await expectSaved(page, withParagraph('```text\nTexto inicial.\n```'));
    await expectLintClean(page);

    await page.locator('.milkdown-code-block .cm-content').click();
    await clickTopBar(page, 'codeBlock');
    await expectSaved(page, ORIGINAL);
  });

  test('citação: aplica e o mesmo botão remove', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await clickTopBar(page, 'quote');
    await expectSaved(page, withParagraph('> Texto inicial.'));
    await expect(topBarButton(page, 'quote')).toHaveClass(/active/);
    await clickTopBar(page, 'quote');
    await expectSaved(page, ORIGINAL);
  });

  test('linha horizontal: insere e, selecionada, o mesmo botão remove', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await page.keyboard.press('End');
    await clickTopBar(page, 'hr');
    await expectSavedMatch(page, /Texto inicial\.\n\n---\n/);
    await expectLintClean(page);

    await editor(page).locator('hr').click();
    await expect(topBarButton(page, 'hr')).toHaveClass(/active/);
    await clickTopBar(page, 'hr');
    await expect(editor(page).locator('hr')).toHaveCount(0);
    await expectSaved(page, ORIGINAL);
  });
});

test.describe('barra: histórico', () => {
  test('desfazer e refazer', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' Mais');
    await expectSaved(page, withParagraph('Texto inicial. Mais'));
    await clickTopBar(page, 'undo');
    await expectSaved(page, ORIGINAL);
    await clickTopBar(page, 'redo');
    await expectSaved(page, withParagraph('Texto inicial. Mais'));
  });

  test('desfazer pelo teclado (Ctrl+Z)', async ({ page }) => {
    await openEditor(page);
    await paragraph(page).click();
    await clickTopBar(page, 'bulletList');
    await expectSaved(page, withParagraph('- Texto inicial.'));
    await page.keyboard.press('Control+z');
    await expectSaved(page, ORIGINAL);
  });
});
