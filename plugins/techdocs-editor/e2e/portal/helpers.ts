import { Page, expect } from '@playwright/test';
import { FakeGitHub } from './fake-github';

export const PORTAL_URL = process.env.PORTAL_URL ?? 'http://localhost:3000';

/** Entidade da wiki de demonstração no catálogo do portal. */
export const ENTITY = 'component:default/wiki-demo';

/** Entra no portal como guest (a app de desenvolvimento: `yarn start` na raiz, ou sobe sozinha nos testes). */
export async function enterPortal(page: Page) {
  await page.goto('/').catch(() => {
    throw new Error(`O portal não respondeu em ${PORTAL_URL}. Rode yarn start na raiz do repositório.`);
  });
  const enter = page.getByRole('button', { name: 'Enter' });
  const sidebar = page.locator('nav[aria-label="sidebar nav"]');
  // O que aparecer primeiro: a tela de entrada (guest) ou o portal já logado
  await expect(enter.or(sidebar).first()).toBeVisible({ timeout: 60_000 });
  if (await enter.isVisible()) await enter.click();
  await expect(sidebar).toBeAttached({ timeout: 60_000 });
}

export const editor = (page: Page) => page.locator('.milkdown .ProseMirror');

/** Portal + GitHub simulado + editor aberto na página `docPage` (ex.: "guias/primeiros-passos"). */
export async function openEditor(page: Page, github: FakeGitHub, docPage = 'guias/primeiros-passos') {
  await github.install(page);
  await enterPortal(page);
  await page.goto(`/docs-editor?${new URLSearchParams({ entity: ENTITY, page: docPage })}`);
  await expect(editor(page)).toBeVisible({ timeout: 30_000 });
}

/** Botões do painel, pelo começo do nome (a dica completa explica o que fazem). */
export const panelButton = (
  page: Page,
  name: 'Salvar rascunho' | 'Salvar e verificar' | 'Enviar para publicação' | 'Enviar para revisão' | 'Descartar rascunho',
) =>
  page.getByRole('button', { name: new RegExp(`^${name}`) });

/** Etiqueta de estado no topo do painel. */
export const status = (page: Page) => page.locator('.MuiChip-label').first();

/** Aviso verde depois de uma ação. */
export const notice = (page: Page) => page.locator('.MuiAlert-standardSuccess');

/** Escreve no fim do parágrafo que contém `text`. */
export async function typeAfter(page: Page, text: string, typed: string) {
  const block = editor(page).locator('p', { hasText: text }).first();
  await block.click();
  await expect
    .poll(async () => {
      await page.keyboard.press('End');
      return block.evaluate(element => {
        const selection = window.getSelection();
        if (!selection?.focusNode || !element.contains(selection.focusNode)) return false;
        const rest = document.createRange();
        rest.setStart(selection.focusNode, selection.focusOffset);
        rest.setEndAfter(element.lastChild ?? element);
        return rest.toString() === '';
      });
    })
    .toBe(true);
  await page.keyboard.type(typed);
}

/** Espera o editor registrar a edição (o aviso de mudança tem atraso) e o lint rodar. */
export async function waitForPending(page: Page) {
  await expect(status(page)).toHaveText('Alterações não salvas');
}

/** Insere um bloco pelo menu "/" numa linha nova no fim do parágrafo que contém `after`. */
export async function insertBlock(page: Page, after: string, label: string, typed = '') {
  await typeAfter(page, after, '');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/');
  await page.locator(`.milkdown-slash-menu li:has(span:text-is("${label}"))`).click();
  await expect(page.locator('.milkdown-slash-menu')).toBeHidden();
  if (typed) await page.keyboard.type(typed);
}

/** Simula a aba indo para segundo plano (`false`) ou voltando (`true`), como o navegador avisa. */
export async function setTabVisible(page: Page, visible: boolean) {
  await page.evaluate(v => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => !v });
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => (v ? 'visible' : 'hidden') });
    document.dispatchEvent(new Event('visibilitychange'));
  }, visible);
}
