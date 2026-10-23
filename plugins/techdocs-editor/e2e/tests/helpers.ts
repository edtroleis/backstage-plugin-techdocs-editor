import { expect, Locator, Page } from '@playwright/test';

/** Botões da barra fixa, na ordem em que aparecem (Crepe + ajustes de topBar.ts). */
export const TOP_BAR = [
  'bold',
  'italic',
  'strikethrough',
  'inlineCode',
  'bulletList',
  'orderedList',
  'taskList',
  'link',
  'image',
  'table',
  'codeBlock',
  'quote',
  'hr',
  'undo',
  'redo',
] as const;
export type TopBarButton = (typeof TOP_BAR)[number];

/** Documento padrão dos testes: começa com título, como pede o lint (MD041). */
export const ORIGINAL = '# Página\n\nTexto inicial.\n';

export const editor = (page: Page) => page.locator('.milkdown .ProseMirror');

/** Abre o editor com o Markdown do repositório `md` e espera ficar pronto. */
export async function openEditor(page: Page, md = ORIGINAL) {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(`/?md=${encodeURIComponent(md)}`);
  await editor(page).waitFor();
  await expect(page.locator('.top-bar-item')).toHaveCount(TOP_BAR.length);
  return { errors };
}

/** Markdown que seria salvo no repositório (undefined enquanto não houve edição). */
export const saved = (page: Page) => page.evaluate(() => window.harness.saved());

/** Espera o Markdown salvo ficar igual a `expected` (o editor avisa mudanças com atraso). */
export async function expectSaved(page: Page, expected: string) {
  await expect.poll(() => saved(page), { message: 'Markdown salvo', timeout: 10_000 }).toBe(expected);
}

/** Espera o Markdown salvo casar com `pattern`. */
export async function expectSavedMatch(page: Page, pattern: RegExp) {
  await expect.poll(() => saved(page), { message: 'Markdown salvo' }).toMatch(pattern);
}

/** Espera o Markdown salvo NÃO casar com `pattern`. */
export async function expectSavedNotMatch(page: Page, pattern: RegExp) {
  await expect.poll(() => saved(page), { message: 'Markdown salvo' }).not.toMatch(pattern);
}

export const topBarButton = (page: Page, name: TopBarButton) =>
  page.locator('.top-bar-item').nth(TOP_BAR.indexOf(name));

export async function clickTopBar(page: Page, name: TopBarButton) {
  await topBarButton(page, name).click();
}

/** Escolhe uma opção do seletor de título da barra (ex.: "Título 2", "Parágrafo"). */
export async function chooseHeading(page: Page, label: string) {
  await page.locator('.top-bar-heading-button').click();
  await page.locator('.top-bar-heading-option', { hasText: new RegExp(`^${label}$`) }).click();
}

/** Coloca o cursor no fim do documento, numa linha nova vazia. */
export async function newLineAtEnd(page: Page) {
  await cursorToEnd(page, editor(page).locator('> p, > h1, > h2, > h3, > ul, > ol, > blockquote').last());
  await page.keyboard.press('Control+End');
  await page.keyboard.press('Enter');
}

/** Digita "/" e escolhe um item do menu de blocos. */
export async function slash(page: Page, label: string) {
  await page.keyboard.type('/');
  await page.locator(`.milkdown-slash-menu li:has(span:text-is("${label}"))`).click();
  // Só depois de o menu fechar o bloco novo está pronto para receber texto
  await expect(page.locator('.milkdown-slash-menu')).toBeHidden();
}

/** Seleciona o texto todo do bloco `block` (do início ao fim da linha). */
export async function selectBlockText(page: Page, block: Locator) {
  await cursorToEnd(page, block);
  await page.keyboard.press('Shift+Home');
}

/** Toolbar que aparece sobre o texto selecionado. */
export const selectionToolbar = (page: Page) => page.locator('.milkdown-toolbar');

/** O Markdown salvo passa no lint da wiki (o mesmo da pipeline). */
export async function expectLintClean(page: Page) {
  const problems = await page.evaluate(() => window.harness.lint().map(p => `linha ${p.line}: ${p.rule} ${p.description}`));
  expect(problems, `lint de:\n${await saved(page)}`).toEqual([]);
}

/** Apaga `count` caracteres para trás. */
export async function backspace(page: Page, count: number) {
  for (let i = 0; i < count; i++) await page.keyboard.press('Backspace');
}

/**
 * O que a pessoa escreveu pode ser salvo: o que o lint aponta tem correção automática e, depois
 * dela (o que o Salvar grava), nada sobra para a pipeline reprovar.
 */
export async function expectSavable(page: Page) {
  const remaining = await page.evaluate(() =>
    window.harness.lintCommitted().map(p => `linha ${p.line}: ${p.rule} ${p.description}`),
  );
  expect(remaining, `lint depois das correções automáticas de:\n${await saved(page)}`).toEqual([]);
}

/** Clica no bloco e põe o cursor no fim dele, esperando o editor posicionar o cursor. */
export async function cursorToEnd(page: Page, block: Locator) {
  await block.click();
  await expect
    .poll(async () => {
      await page.keyboard.press('End');
      const { atEnd, lineBelow } = await block.evaluate(element => {
        const selection = window.getSelection();
        if (!selection?.focusNode || !element.contains(selection.focusNode)) return { atEnd: false, lineBelow: false };
        const rest = document.createRange();
        rest.setStart(selection.focusNode, selection.focusOffset);
        rest.setEndAfter(element.lastChild ?? element);
        const caret = selection.getRangeAt(0).getClientRects()[0];
        const lastLine = [...rest.getClientRects()].at(-1);
        return {
          atEnd: rest.toString() === '',
          // Ainda há texto do bloco numa linha abaixo do cursor (parágrafo que quebra na tela)
          lineBelow: Boolean(caret && lastLine && lastLine.top > caret.bottom - 2),
        };
      });
      // End vai só até o fim da linha na tela: num parágrafo que quebra em várias, desce uma linha
      if (lineBelow) await page.keyboard.press('ArrowDown');
      return atEnd;
    }, { message: 'cursor no fim do bloco' })
    .toBe(true);
}
