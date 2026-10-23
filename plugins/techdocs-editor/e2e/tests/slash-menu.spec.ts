import { expect, test } from '@playwright/test';
import {
  backspace,
  chooseHeading,
  clickTopBar,
  editor,
  expectSaved,
  expectSavable,
  expectLintClean,
  expectSavedMatch,
  newLineAtEnd,
  ORIGINAL,
  openEditor,
  slash,
  topBarButton,
} from './helpers';

/**
 * Cada item do menu "/": inserir, conferir o Markdown salvo e remover durante a edição.
 * O resultado final tem de voltar ao arquivo original.
 */


test.describe('menu /: itens oferecidos', () => {
  test('lista exatamente os blocos esperados', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await page.keyboard.type('/');
    await expect(page.locator('.milkdown-slash-menu li > span:not(.milkdown-icon)')).toHaveText([
      'Texto',
      'Título 1',
      'Título 2',
      'Título 3',
      'Título 4',
      'Título 5',
      'Título 6',
      'Citação',
      'Linha horizontal',
      'Lista com marcadores',
      'Lista numerada',
      'Lista de tarefas',
      'Imagem',
      'Bloco de código',
      'Tabela',
    ]);
  });

  test('filtra pelo que é digitado depois da barra', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await page.keyboard.type('/tít');
    await expect(page.locator('.milkdown-slash-menu li > span:not(.milkdown-icon)')).toHaveText([
      'Título 1',
      'Título 2',
      'Título 3',
      'Título 4',
      'Título 5',
      'Título 6',
    ]);
  });

  test('Esc fecha o menu sem inserir nada', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await page.keyboard.type('/');
    await expect(page.locator('.milkdown-slash-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.milkdown-slash-menu')).toBeHidden();
  });
});

test.describe('menu /: inserir e remover', () => {
  for (const level of [1, 2, 3, 4, 5, 6]) {
    test(`Título ${level}`, async ({ page }) => {
      await openEditor(page);
      await newLineAtEnd(page);
      await slash(page, `Título ${level}`);
      await page.keyboard.type('Seção');
      await expectSaved(page, `${ORIGINAL}\n${'#'.repeat(level)} Seção\n`);
      await expectSavable(page);

      // Remover: voltar a parágrafo e apagar o texto (voltar ao original também é mudança)
      await chooseHeading(page, 'Parágrafo');
      await expectSaved(page, `${ORIGINAL}\nSeção\n`);
      await page.keyboard.press('End');
      await backspace(page, 'Seção'.length + 1);
      await expectSaved(page, ORIGINAL);
    });
  }

  test('Text transforma um título vazio de volta em parágrafo', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Título 2');
    await expect(editor(page).locator('h2')).toHaveCount(1);
    // O menu "/" só abre em linha vazia: no título ainda vazio, "Text" o volta a parágrafo
    await slash(page, 'Texto');
    await expect(editor(page).locator('h2')).toHaveCount(0);
    await page.keyboard.type('Corpo');
    await expectSaved(page, `${ORIGINAL}\nCorpo\n`);
  });

  test('Citação', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Citação');
    await page.keyboard.type('Citação');
    await expectSaved(page, `${ORIGINAL}\n> Citação\n`);

    // Remover: o botão de citação da barra tira a citação
    await expectLintClean(page);
    await clickTopBar(page, 'quote');
    await expectSaved(page, `${ORIGINAL}\nCitação\n`);
    await page.keyboard.press('End');
    await backspace(page, 'Citação'.length + 1);
    await expectSaved(page, ORIGINAL);
  });

  test('Linha horizontal', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Linha horizontal');
    await expectSavedMatch(page, /^# Página\n\nTexto inicial\.\n\n---\n/);
    await expectLintClean(page);

    // Remover: clicar na linha (seleciona) e apagar
    await editor(page).locator('hr').click();
    await page.keyboard.press('Backspace');
    await expectSaved(page, ORIGINAL);
  });

  const lists = [
    { label: 'Lista com marcadores', marker: '- ' },
    { label: 'Lista numerada', marker: '1. ' },
    { label: 'Lista de tarefas', marker: '- [ ] ' },
  ];
  for (const { label, marker } of lists) {
    test(label, async ({ page }) => {
      await openEditor(page);
      await newLineAtEnd(page);
      await slash(page, label);
      await page.keyboard.type('um');
      await page.keyboard.press('Enter');
      await page.keyboard.type('dois');
      const second = marker === '1. ' ? '2. ' : marker;
      await expectSaved(page, `${ORIGINAL}\n${marker}um\n${second}dois\n`);
      await expectLintClean(page);

      // Remover pelo teclado: apagar o texto; Backspace no item vazio tira o item da lista e
      // outro Backspace junta a linha com a anterior
      await backspace(page, 'dois'.length + 2);
      await expectSaved(page, `${ORIGINAL}\n${marker}um\n`);
      await backspace(page, 'um'.length + 2);
      await expectSaved(page, ORIGINAL);
    });
  }

  test('Bloco de código', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Bloco de código');
    await expect(page.locator('.milkdown-code-block .cm-content')).toBeFocused();
    await page.keyboard.type('echo oi');
    await expectSaved(page, `${ORIGINAL}\n\`\`\`text\necho oi\n\`\`\`\n`);
    await expectLintClean(page);

    // Remover: apagar o código e, com o bloco vazio, Backspace tira o bloco
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');
    await expectSaved(page, ORIGINAL);
    await expect(page.locator('.milkdown-code-block')).toHaveCount(0);
  });

  test('Tabela', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Tabela');
    await expect(page.locator('.milkdown-table-block')).toHaveCount(1);
    await page.keyboard.type('Coluna');
    await expectSavedMatch(page, /^# Página\n\nTexto inicial\.\n\n\| Coluna \|/);
    await expectLintClean(page);

    // Remover: com o cursor na tabela, o botão de tabela da barra a remove
    await expect(topBarButton(page, 'table')).toHaveClass(/active/);
    await clickTopBar(page, 'table');
    await expectSaved(page, ORIGINAL);
    await expect(page.locator('.milkdown-table-block')).toHaveCount(0);
  });

  test('Imagem', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Imagem');
    const block = page.locator('.milkdown-image-block');
    await expect(block).toHaveCount(1);
    await expect(block.getByText('Escolher imagem do computador')).toBeVisible();

    // Enviar um arquivo pelo botão
    const chooser = page.waitForEvent('filechooser');
    await block.locator('label.uploader').click();
    await (await chooser).setFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('png') });
    await expectSavedMatch(page, /^# Página\n\nTexto inicial\.\n\n!\[[^\]]*\]\(\.\.\/assets\/foto\.png\)\n$/);
    await expectLintClean(page);
    await expect(block.locator('img')).toBeVisible();

    // Remover: clicar na imagem (seleciona o bloco) e apagar
    await block.locator('.image-wrapper').click();
    await page.keyboard.press('Backspace');
    await expectSaved(page, ORIGINAL);
    await expect(block).toHaveCount(0);
  });

  test('Image pelo endereço colado', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Imagem');
    const input = page.locator('.milkdown-image-block input.link-input-area');
    await input.fill('https://exemplo.com/a.png');
    await input.press('Enter');
    await expectSavedMatch(page, /!\[[^\]]*\]\(https:\/\/exemplo\.com\/a\.png\)\n$/);
  });

  test('Image deixada vazia não vai para o arquivo', async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, 'Imagem');
    await editor(page).locator('p').first().click();
    await page.keyboard.press('End');
    await page.keyboard.type('!');
    await expectSaved(page, '# Página\n\nTexto inicial.!\n');
  });
});
