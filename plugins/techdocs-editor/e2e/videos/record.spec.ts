import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, Locator, Page, test } from '@playwright/test';
import { FakeGitHub } from '../portal/fake-github';
import { editor, enterPortal } from '../portal/helpers';

/** Vídeos crus (webm), convertidos depois em GIF por scripts/make-videos.mjs. */
const OUT = join(__dirname, '../../../../node_modules/.cache/editor-videos');
const DOC = '/docs/default/component/wiki-demo/guias/primeiros-passos/';
const FILE = 'docs/guias/primeiros-passos.md';

/**
 * O Playwright não desenha o ponteiro: um cursor e uma legenda na própria página, para o vídeo
 * mostrar onde a pessoa clica e o que está acontecendo.
 */
const OVERLAY = `
  window.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = \`
      #demo-cursor { position: fixed; z-index: 2147483647; width: 22px; height: 22px; margin: -3px 0 0 -3px;
        pointer-events: none; transition: transform .08s; background: no-repeat center/contain
        url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 2l16 9-7 2-3 7z' fill='%23111' stroke='%23fff' stroke-width='1.5'/%3E%3C/svg%3E"); }
      #demo-cursor.down { transform: scale(.8); }
      #demo-caption { position: fixed; z-index: 2147483646; left: 50%; bottom: 24px; transform: translateX(-50%);
        max-width: 80%; padding: 10px 18px; border-radius: 8px; background: rgba(17,17,17,.85); color: #fff;
        font: 500 18px/1.3 system-ui, sans-serif; pointer-events: none; opacity: 0; transition: opacity .2s; }
      #demo-caption.on { opacity: 1; }
    \`;
    document.head.appendChild(style);
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    const caption = document.createElement('div');
    caption.id = 'demo-caption';
    document.body.append(cursor, caption);
    addEventListener('mousemove', e => { cursor.style.left = e.clientX + 'px'; cursor.style.top = e.clientY + 'px'; }, true);
    addEventListener('mousedown', () => cursor.classList.add('down'), true);
    addEventListener('mouseup', () => cursor.classList.remove('down'), true);
    window.__caption = text => { caption.textContent = text; caption.classList.toggle('on', Boolean(text)); };
  });
`;

const caption = async (page: Page, text: string) => {
  await page.evaluate(t => (window as any).__caption?.(t), text);
};

/** Leva o cursor até o elemento, devagar como uma pessoa, e clica. */
async function clickLike(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 18 });
  await page.waitForTimeout(250);
  await target.click();
}

const typeSlowly = (page: Page, text: string) => page.keyboard.type(text, { delay: 55 });

/** Quando o vídeo de cada teste começa a interessar (depois da entrada no portal), em segundos. */
const starts: Record<string, number> = {};
let recordingSince = 0;

// A gravação começa quando a página é criada, logo antes de cada teste
test.beforeEach(({ page }) => {
  recordingSince = page ? Date.now() : 0;
});

/** Entra no portal em inglês, com o GitHub simulado; o GIF começa depois disso. */
async function start(page: Page, github: FakeGitHub) {
  await page.addInitScript(() => window.localStorage.setItem('language', 'en'));
  await page.addInitScript(OVERLAY);
  await github.install(page);
  await enterPortal(page);
}

/** Marca o começo do trecho que vai para o GIF. */
const mark = async (page: Page, name: string) => {
  // Um quadro pintado depois de tudo pronto, para o corte não pegar a tela ainda carregando
  await page.waitForTimeout(400);
  starts[name] = (Date.now() - recordingSince) / 1000;
};

async function save(page: Page, name: string) {
  await page.waitForTimeout(1200);
  const video = page.video()!;
  await page.close();
  mkdirSync(OUT, { recursive: true });
  await video.saveAs(join(OUT, `${name}.webm`));
  const file = join(OUT, 'starts.json');
  let saved: Record<string, number> = {};
  try {
    saved = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    // primeiro vídeo
  }
  writeFileSync(file, JSON.stringify({ ...saved, [name]: starts[name] ?? 0 }, null, 2));
}

const panel = (page: Page, name: RegExp) => page.getByRole('button', { name });
const status = (page: Page) => page.locator('.MuiChip-label').first();

test('edit-and-publish', async ({ page }) => {
  const github = new FakeGitHub();
  await start(page, github);
  await page.goto(DOC);
  await expect(page.getByRole('button', { name: 'Edit this page' })).toBeVisible();
  // Conteúdo do TechDocs (dentro do shadow DOM, que o Playwright atravessa)
  await expect(page.locator('h1', { hasText: 'Primeiros passos' }).first()).toBeVisible();
  await mark(page, 'edit-and-publish');
  await page.waitForTimeout(1500);
  await caption(page, 'Click the pencil on any TechDocs page');
  await clickLike(page, page.getByRole('button', { name: 'Edit this page' }));
  await expect(editor(page).locator('h1')).toBeVisible();
  await caption(page, 'Write as in a regular text editor');
  const paragraph = editor(page).locator('p', { hasText: 'Experimente editá-la!' }).first();
  await clickLike(page, paragraph);
  await page.keyboard.press('End');
  await typeSlowly(page, ' Edited in the portal, no Git needed.');
  await page.keyboard.press('Enter');
  await page.keyboard.type('/');
  await page.waitForTimeout(700);
  await clickLike(page, page.locator('.milkdown-slash-menu li:has(span:text-is("Bulleted list"))'));
  await typeSlowly(page, 'Lists, tables and images from the "/" menu');
  await expect(status(page)).toHaveText('Unsaved changes');
  await caption(page, 'Save and check: the pipeline runs on a draft pull request');
  await clickLike(page, panel(page, /^Save and check/));
  await expect(status(page)).toHaveText('Draft');
  await page.waitForTimeout(1500);
  await caption(page, 'All checks passed: send it for publication');
  await clickLike(page, panel(page, /^Send for publication/));
  await expect(status(page)).toHaveText('Waiting to be published');
  await page.waitForTimeout(1500);
  await save(page, 'edit-and-publish');
});

test('checks-in-plain-language', async ({ page }) => {
  const github = new FakeGitHub();
  github.nextOutcome = {
    Links: {
      conclusion: 'failure',
      annotations: [{ path: FILE, line: 3, message: `${FILE}:3 Broken link: missing-page.md` }],
    },
  };
  // A mensagem do job em linguagem simples vem do .techdocs-editor.yaml do repositório
  github.publishOnMain('.techdocs-editor.yaml', "verification:\n  checkHelp:\n    Links: Some links don't work.\n");
  await start(page, github);
  await page.goto(`/docs-editor?${new URLSearchParams({ entity: 'component:default/wiki-demo', page: 'guias/primeiros-passos' })}`);
  await expect(editor(page).locator('h1')).toBeVisible();
  await expect(editor(page).locator('p').first()).toBeVisible();
  await mark(page, 'checks-in-plain-language');
  await page.waitForTimeout(800);
  const paragraph = editor(page).locator('p', { hasText: 'Experimente editá-la!' }).first();
  await clickLike(page, paragraph);
  await page.keyboard.press('End');
  await typeSlowly(page, ' See the new page.');
  await caption(page, 'Save and check');
  await clickLike(page, panel(page, /^Save and check/));
  await expect(status(page)).toHaveText('Needs fixes');
  await caption(page, 'A failed check, in plain language, with the line in the editor');
  await page.waitForTimeout(1800);
  await caption(page, '"Show line" opens the Markdown right at the problem');
  await clickLike(page, page.getByRole('button', { name: 'show line' }).first());
  await expect(page.locator('.cm-content')).toBeFocused();
  await page.waitForTimeout(1800);
  await caption(page, 'Fix it and check again: sending stays blocked until it passes');
  await page.keyboard.press('End');
  await typeSlowly(page, ' Fixed.');
  await clickLike(page, panel(page, /^Save and check/));
  await expect(status(page)).toHaveText('Draft');
  await page.waitForTimeout(1500);
  await save(page, 'checks-in-plain-language');
});

test('markdown-and-lint', async ({ page }) => {
  const github = new FakeGitHub();
  await start(page, github);
  await page.goto(`/docs-editor?${new URLSearchParams({ entity: 'component:default/wiki-demo', page: 'guias/primeiros-passos' })}`);
  await expect(editor(page).locator('h1')).toBeVisible();
  await expect(editor(page).locator('p').first()).toBeVisible();
  await mark(page, 'markdown-and-lint');
  await page.waitForTimeout(800);
  await caption(page, 'Prefer Markdown? Switch views, same document');
  await clickLike(page, page.getByRole('button', { name: 'Markdown' }));
  const source = page.locator('.cm-content');
  await expect(source).toBeVisible();
  await page.waitForTimeout(1200);
  await caption(page, "Lint while typing, with the repository's own rules");
  await clickLike(page, source.locator('.cm-line', { hasText: 'Experimente editá-la!' }).first());
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Enter');
  await typeSlowly(page, '# A second title');
  await page.waitForTimeout(2500);
  await caption(page, 'Back to the visual editor');
  await clickLike(page, page.getByRole('button', { name: 'Visual' }));
  await page.waitForTimeout(2000);
  await save(page, 'markdown-and-lint');
});
