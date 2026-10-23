import { Locator, Page, expect, test } from '@playwright/test';
import {
  backspace,
  chooseHeading,
  clickTopBar,
  cursorToEnd,
  editor,
  expectLintClean,
  expectSavable,
  expectSaved,
  openEditor,
  saved,
  slash,
} from './helpers';
import { PAGES } from './pages';

/**
 * Cenários de edição nas páginas reais: o que uma pessoa faz no dia a dia. Em cada cenário:
 * - o Markdown salvo pode ser publicado (lint limpo, ou só com o que o Salvar ajusta sozinho);
 * - o resto do arquivo não muda;
 * - ao desfazer a edição (removendo o que foi inserido), o arquivo volta a ser o original.
 */

/** Blocos de texto de nível superior onde dá para pôr o cursor: parágrafos e títulos. */
const textBlocks = (page: Page) => editor(page).locator('> p, > h1, > h2, > h3, > h4, > h5, > h6');

/** Posições onde inserir: logo depois do título, no meio e no fim da página. */
async function insertionPoints(page: Page): Promise<Array<{ name: string; index: number }>> {
  const count = await textBlocks(page).count();
  const points = [
    { name: 'depois do título', index: 0 },
    { name: 'no meio', index: Math.floor(count / 2) },
    { name: 'no fim', index: count - 1 },
  ];
  return points.filter((p, i) => points.findIndex(q => q.index === p.index) === i);
}

/** Nova linha vazia logo depois do bloco `index`. */
async function newLineAfter(page: Page, index: number) {
  await cursorToEnd(page, textBlocks(page).nth(index));
  await page.keyboard.press('Enter');
}

type Component = {
  name: string;
  insert: (page: Page) => Promise<void>;
  /** `anchor`: o bloco depois do qual o componente foi inserido. */
  remove: (page: Page, anchor: Locator) => Promise<void>;
  /** 'clean': o Markdown gerado tem de passar no lint; 'savable': pode depender de ajuste automático. */
  lint: 'clean' | 'savable';
};

const typed = (label: string, text: string, removeWith?: (page: Page) => Promise<void>): Component => ({
  name: label,
  lint: label.startsWith('Título') ? 'savable' : 'clean',
  insert: async page => {
    await slash(page, label);
    await page.keyboard.type(text);
    await expect.poll(() => saved(page)).toContain(text);
  },
  remove: async page => {
    await removeWith?.(page);
    await page.keyboard.press('End');
    await backspace(page, text.length + 1);
  },
});

const list = (label: string): Component => ({
  name: label,
  lint: 'clean',
  insert: async page => {
    await slash(page, label);
    await page.keyboard.type('um');
    await expect.poll(() => saved(page)).toContain('um');
    await page.keyboard.press('Enter');
    // Como uma pessoa: escreve no item novo depois que ele aparece
    await expect.poll(() => page.evaluate(() => window.getSelection()?.focusNode?.textContent ?? '')).toBe('');
    await page.keyboard.type('dois');
    await expect.poll(() => saved(page)).toMatch(/um\n.*dois\n/);
  },
  remove: async page => {
    await backspace(page, 'dois'.length + 2);
    await backspace(page, 'um'.length + 2);
  },
});

const COMPONENTS: Component[] = [
  typed('Texto', 'Novo parágrafo'),
  ...[1, 2, 3, 4, 5, 6].map(level =>
    typed(`Título ${level}`, 'Nova seção', page => chooseHeading(page, 'Parágrafo')),
  ),
  typed('Citação', 'Citação nova', page => clickTopBar(page, 'quote')),
  list('Lista com marcadores'),
  list('Lista numerada'),
  list('Lista de tarefas'),
  {
    name: 'Linha horizontal',
    lint: 'clean',
    insert: page => slash(page, 'Linha horizontal'),
    // Clicar na linha a seleciona; Backspace apaga
    remove: async (_page, anchor) => {
      await anchor.locator('xpath=following-sibling::hr[1]').click();
      await _page.keyboard.press('Backspace');
    },
  },
  {
    name: 'Bloco de código',
    lint: 'clean',
    insert: async page => {
      await slash(page, 'Bloco de código');
      await expect(page.locator('.milkdown-code-block .cm-editor.cm-focused')).toHaveCount(1);
      await page.keyboard.type('echo oi');
    },
    remove: async page => {
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
    },
  },
  {
    name: 'Tabela',
    lint: 'clean',
    insert: async page => {
      await slash(page, 'Tabela');
      await page.keyboard.type('Coluna');
    },
    remove: page => clickTopBar(page, 'table'),
  },
  {
    name: 'Imagem',
    lint: 'clean',
    insert: async page => {
      await slash(page, 'Imagem');
      const uploader = page.locator('.milkdown-image-block:not(:has(img)) label.uploader');
      await expect(uploader).toBeVisible();
      const chooser = page.waitForEvent('filechooser');
      await uploader.click();
      await (await chooser).setFiles({ name: 'nova.png', mimeType: 'image/png', buffer: Buffer.from('png') });
      await expect.poll(() => saved(page)).toContain('nova.png');
    },
    // A imagem nova é o bloco logo depois do ponto de inserção (a página pode ter outras imagens)
    remove: async (page, anchor) => {
      await anchor.locator('xpath=following-sibling::*[1]').locator('.image-wrapper').click();
      await page.keyboard.press('Backspace');
    },
  },
];

for (const testPage of PAGES) {
  test.describe(testPage.name, () => {
    test('abre sem mudar nada e passa no lint', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      await page.waitForTimeout(500);
      expect(await page.evaluate(() => window.harness.changes)).toBe(0);
      await expectLintClean(page);
    });

    for (const component of COMPONENTS) {
      test(`inserir e remover: ${component.name}`, async ({ page }) => {
        await openEditor(page, testPage.markdown);
        for (const point of await insertionPoints(page)) {
          await test.step(point.name, async () => {
            await newLineAfter(page, point.index);
            await component.insert(page);
            await expect.poll(async () => (await saved(page)) ?? testPage.markdown, { message: 'inseriu' }).not.toBe(testPage.markdown);
            if (component.lint === 'clean') await expectLintClean(page);
            else await expectSavable(page);
            await component.remove(page, textBlocks(page).nth(point.index));
            await expectSaved(page, testPage.markdown);
          });
        }
      });
    }

    test('digitar no fim de cada parágrafo', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      const paragraphs = editor(page).locator('> p');
      const count = await paragraphs.count();
      for (let i = 0; i < count; i++) {
        await cursorToEnd(page, paragraphs.nth(i));
        await page.keyboard.type(' Editado ');
      }
      await expect.poll(() => saved(page)).toBeDefined();
      await expect.poll(async () => ((await saved(page)) ?? '').split('Editado').length - 1).toBe(count);
      // O espaço digitado no fim não vai para o arquivo
      await expectLintClean(page);
    });

    test('Enter várias vezes (linhas vazias) não muda o arquivo', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      for (const point of await insertionPoints(page)) {
        await cursorToEnd(page, textBlocks(page).nth(point.index));
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(500);
      // Linhas vazias saem ao salvar: o arquivo continua igual
      expect((await saved(page)) ?? testPage.markdown).toBe(testPage.markdown);
      await expectLintClean(page);
    });

    test('quebrar e juntar parágrafos', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      const paragraph = editor(page).locator('> p').first();
      await paragraph.click();
      await page.keyboard.press('Home');
      await page.keyboard.press('Control+ArrowRight');
      await page.keyboard.press('Enter');
      await expect.poll(() => saved(page)).toBeDefined();
      await expectLintClean(page);
      await page.keyboard.press('Backspace');
      await expectSaved(page, testPage.markdown);
    });

    test('apagar um parágrafo inteiro', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      const paragraph = editor(page).locator('> p').first();
      const text = (await paragraph.textContent()) ?? '';
      // Clique triplo seleciona o parágrafo todo; Shift+Home só vai até o começo da linha na tela,
      // e um parágrafo longo quebra em várias
      await paragraph.click({ clickCount: 3 });
      await page.keyboard.press('Backspace');
      await page.keyboard.press('Backspace');
      await expect.poll(() => saved(page)).toBeDefined();
      expect(await saved(page)).not.toContain(`${text.split(' ')[0]} ${text.split(' ')[1]}`);
      await expectLintClean(page);
    });

    for (const level of [1, 2, 3, 4, 5, 6]) {
      test(`transformar um parágrafo em Título ${level}`, async ({ page }) => {
        await openEditor(page, testPage.markdown);
        await editor(page).locator('> p').first().click();
        await chooseHeading(page, `Título ${level}`);
        await expect.poll(() => saved(page)).toBeDefined();
        await expectSavable(page);
        await chooseHeading(page, 'Parágrafo');
        await expectSaved(page, testPage.markdown);
      });
    }

    test('mudar o nível de cada título', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      const headings = editor(page).locator('> h2, > h3');
      const count = await headings.count();
      for (let i = 0; i < count; i++) {
        await headings.nth(i).click();
        await chooseHeading(page, 'Título 3');
      }
      if (count) {
        await expect.poll(() => saved(page)).toBeDefined();
        await expectSavable(page);
      }
    });

    test('negrito, itálico e código numa palavra', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      for (const button of ['bold', 'italic', 'inlineCode'] as const) {
        await cursorToEnd(page, editor(page).locator('> p').first());
        await page.keyboard.press('Home');
        await page.keyboard.press('Control+Shift+ArrowRight');
        await expect.poll(() => page.evaluate(() => window.getSelection()?.toString() ?? '')).not.toBe('');
        await clickTopBar(page, button);
        await expect.poll(() => saved(page)).toBeDefined();
        await expectLintClean(page);
        await clickTopBar(page, button);
        await expectSaved(page, testPage.markdown);
      }
    });

    test('link numa palavra', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      await cursorToEnd(page, editor(page).locator('> p').first());
      await page.keyboard.type(' veja');
      await page.keyboard.press('Shift+Control+ArrowLeft');
      await clickTopBar(page, 'link');
      const input = page.locator('.milkdown-link-edit input');
      await input.fill('https://exemplo.com');
      await input.press('Enter');
      await expect.poll(() => saved(page)).toContain('[veja](https://exemplo.com)');
      await expectLintClean(page);
    });

    test('colar texto de outro lugar', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      await cursorToEnd(page, editor(page).locator('> p').last());
      await page.keyboard.press('Enter');
      await paste(page, 'Primeira linha colada.\n\nSegunda linha colada.  \n');
      await expect.poll(() => saved(page)).toContain('Segunda linha colada.');
      await expectLintClean(page);
    });

    test('colar Markdown com título e lista', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      await cursorToEnd(page, editor(page).locator('> p').last());
      await page.keyboard.press('Enter');
      await paste(page, '## Colado\n\n- item a\n- item b\n');
      await expect.poll(() => saved(page)).toContain('item b');
      await expectSavable(page);
    });

    test('várias edições e desfazer tudo (Ctrl+Z) volta ao original', async ({ page }) => {
      await openEditor(page, testPage.markdown);
      await cursorToEnd(page, editor(page).locator('> p').first());
      await page.keyboard.type(' A');
      await clickTopBar(page, 'bulletList');
      await page.keyboard.press('Enter');
      await page.keyboard.type('B');
      await expect.poll(() => saved(page)).toBeDefined();
      for (let i = 0; i < 20 && (await saved(page)) !== testPage.markdown; i++) {
        await page.keyboard.press('Control+z');
        await page.waitForTimeout(250);
      }
      await expectSaved(page, testPage.markdown);
    });
  });
}

/** Cola `text` no editor como se viesse da área de transferência. */
async function paste(page: Page, text: string) {
  await page.evaluate(content => {
    const data = new DataTransfer();
    data.setData('text/plain', content);
    document
      .querySelector('.milkdown .ProseMirror')!
      .dispatchEvent(new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }));
  }, text);
}
