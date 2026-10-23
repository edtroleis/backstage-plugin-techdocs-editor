import { Page, expect, test } from '@playwright/test';
import { FakeGitHub, wikiFiles } from './fake-github';
import { editor, enterPortal, insertBlock, notice, openEditor, panelButton, status, typeAfter, waitForPending } from './helpers';

/**
 * Demais funções da página do editor e do addon do TechDocs, no portal com o GitHub simulado:
 * modo Markdown, busca, imagem, voltar, marcas da pipeline, configuração do lint do repositório,
 * falhas do GitHub e o "¶" escondido.
 */

const FILE = 'docs/guias/primeiros-passos.md';
const BRANCH = 'docs/pessoa-teste/docs-guias-primeiros-passos';
const ANCHOR = 'Experimente editá-la!';

const source = (page: Page) => page.locator('.cm-editor .cm-content');
const mode = (page: Page, name: 'Visual' | 'Markdown') => page.getByRole('button', { name, exact: true });

test.describe('modo Markdown', () => {
  test('alternar leva o texto nos dois sentidos e a edição no Markdown é salva', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await typeAfter(page, ANCHOR, ' Do visual.');
    await waitForPending(page);

    await mode(page, 'Markdown').click();
    await expect(source(page)).toContainText('Experimente editá-la! Do visual.');
    // Edita no Markdown: vai para o fim do parágrafo e escreve com sintaxe
    await source(page).locator('.cm-line', { hasText: 'Do visual.' }).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' **Do Markdown.**');

    await mode(page, 'Visual').click();
    await expect(editor(page).locator('strong', { hasText: 'Do Markdown.' })).toBeVisible();
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.file(FILE, BRANCH)).toContain('Experimente editá-la! Do visual. **Do Markdown.**');
  });

  test('Desfazer e Refazer do modo Markdown', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await mode(page, 'Markdown').click();
    await source(page).locator('.cm-line', { hasText: ANCHOR }).click();
    await page.keyboard.press('End');
    await page.keyboard.type(' X');
    await expect(source(page)).toContainText(`${ANCHOR} X`);
    await page.getByRole('button', { name: 'Desfazer' }).click();
    await expect(source(page)).not.toContainText(`${ANCHOR} X`);
    await page.getByRole('button', { name: 'Refazer' }).click();
    await expect(source(page)).toContainText(`${ANCHOR} X`);
  });

  test('números de linha iguais aos do arquivo', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await mode(page, 'Markdown').click();
    const lines = github.file(FILE)!.split('\n').length;
    await expect(page.locator('.cm-lineNumbers .cm-gutterElement', { hasText: new RegExp(`^${lines - 1}$`) })).toHaveCount(1);
  });
});

test.describe('busca', () => {
  test('no modo visual: conta, navega e fecha com Esc', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await page.getByRole('button', { name: 'Buscar (Ctrl+F)' }).click();
    const field = page.getByPlaceholder('Buscar no texto');
    await field.fill('alterações');
    await expect(page.getByText('1 de 2')).toBeVisible();
    await field.press('Enter');
    await expect(page.getByText('2 de 2')).toBeVisible();
    await field.press('Shift+Enter');
    await expect(page.getByText('1 de 2')).toBeVisible();
    await field.fill('nada-disso');
    await expect(page.getByText('nenhum resultado')).toBeVisible();
    await field.press('Escape');
    await expect(field).toHaveCount(0);
  });

  test('Ctrl+F dentro do editor visual abre a busca do editor', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await editor(page).locator('p', { hasText: ANCHOR }).click();
    await page.keyboard.press('Control+f');
    await expect(page.getByPlaceholder('Buscar no texto')).toBeFocused();
  });

  test('no modo Markdown: a busca do editor de código, em português', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await mode(page, 'Markdown').click();
    await page.getByRole('button', { name: 'Buscar (Ctrl+F)' }).click();
    await expect(page.locator('.cm-search input[name="search"]')).toHaveAttribute('placeholder', 'Buscar');
  });
});

test.describe('imagem', () => {
  test('enviar do computador: commit em docs/assets na branch e caminho relativo no texto', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Imagem');
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.milkdown-image-block label.uploader').click();
    await (await chooser).setFiles({ name: 'Minha Foto.png', mimeType: 'image/png', buffer: Buffer.from('imagem') });

    // Nome com espaço e maiúsculas vira um nome de arquivo seguro, com data na frente
    const uploaded = () => Object.keys(github.files(BRANCH) ?? {}).find(f => /minha-foto/.test(f));
    await expect.poll(uploaded).toMatch(/^docs\/assets\/\d+-minha-foto\.png$/);
    const asset = uploaded()!;
    // A imagem aparece no editor lida do rascunho
    await expect(page.locator('.milkdown-image-block img')).toHaveAttribute('src', /^blob:/);
    // A imagem não dispara a pipeline: o rascunho fica "não verificado" até Salvar e verificar
    expect(github.branchCommits(BRANCH).at(-1)!.message).toContain('[skip ci]');
    // O endereço da imagem entra no texto logo depois do envio (o editor avisa mudanças com atraso)
    await page.waitForTimeout(1_000);
    await waitForPending(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.file(FILE, BRANCH)).toContain(`](../${asset.replace('docs/', '')})`);
  });

  test('com PR aberto, enviar imagem não dispara a pipeline e pede nova verificação', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await typeAfter(page, ANCHOR, ' Um.');
    await waitForPending(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    expect(github.pipelineRuns).toHaveLength(1);

    await insertBlock(page, ANCHOR, 'Imagem');
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.milkdown-image-block label.uploader').click();
    await (await chooser).setFiles({ name: 'foto.png', mimeType: 'image/png', buffer: Buffer.from('imagem') });
    await expect(page.locator('.milkdown-image-block img')).toHaveAttribute('src', /^blob:/);
    expect(github.pipelineRuns).toHaveLength(1);
    await expect(panelButton(page, 'Enviar para publicação')).toBeDisabled();
  });

  test('arquivo que não é imagem: mensagem na tela, nada enviado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Imagem');
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.milkdown-image-block label.uploader').click();
    await (await chooser).setFiles({ name: 'planilha.csv', mimeType: 'text/csv', buffer: Buffer.from('a,b') });
    await expect(page.getByText('Não foi possível enviar a imagem: "planilha.csv" não é uma imagem')).toBeVisible();
    expect(github.calls.filter(c => c.startsWith('PUT'))).toHaveLength(0);
  });

  test('imagem maior que o limite (5 MB por padrão): mensagem na tela, nada enviado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Imagem');
    const chooser = page.waitForEvent('filechooser');
    await page.locator('.milkdown-image-block label.uploader').click();
    await (await chooser).setFiles({ name: 'enorme.png', mimeType: 'image/png', buffer: Buffer.alloc(6 * 1024 * 1024) });
    await expect(page.getByText('Não foi possível enviar a imagem: "enorme.png" passa de 5 MB. Use uma imagem menor.')).toBeVisible();
    expect(github.calls.filter(c => c.startsWith('PUT'))).toHaveLength(0);
  });
});

test.describe('navegação e página da doc', () => {
  test('"Voltar para a página" volta para a página que estava sendo editada', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await page.getByRole('link', { name: 'Voltar para a página' }).click();
    await expect(page).toHaveURL(/\/docs\/default\/component\/wiki-demo\/guias\/primeiros-passos/);
  });

  test('o "¶" ao lado dos títulos e o "editar no GitHub" do MkDocs ficam escondidos na página da doc', async ({ page }) => {
    const github = new FakeGitHub();
    await github.install(page);
    await enterPortal(page);
    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    await expect(page.getByRole('button', { name: 'Editar esta página' })).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(() =>
        page.evaluate(() => {
          const root = [...document.querySelectorAll('*')].map(e => e.shadowRoot).find(r => r?.querySelector('.headerlink'));
          const link = root?.querySelector('.headerlink');
          return link ? getComputedStyle(link).display : 'sem link';
        }),
      )
      .toBe('none');
    // O lápis é o único jeito de editar: o ícone do tema (vem do repo_url) não aparece
    await expect
      .poll(() =>
        page.evaluate(() => {
          const root = [...document.querySelectorAll('*')].map(e => e.shadowRoot).find(r => r?.querySelector('.md-content__button'));
          const icons = [...(root?.querySelectorAll('.md-content__button') ?? [])];
          return icons.length ? icons.every(i => getComputedStyle(i).display === 'none') : 'sem ícone';
        }),
      )
      .toBe(true);
  });

  test('datas no alto da página (dd/mm/aaaa hh:mm:ss) e não no rodapé, também ao trocar de página', async ({ page }) => {
    const github = new FakeGitHub();
    await github.install(page);
    await enterPortal(page);
    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    const dates = page.getByTestId('page-dates');
    const format = /^Última atualização: \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}\nData de criação: \d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}$/;
    await expect(dates).toHaveText(format, { timeout: 30_000, useInnerText: true });
    const footerHidden = () =>
      page.evaluate(() => {
        const root = [...document.querySelectorAll('*')].map(e => e.shadowRoot).find(r => r?.querySelector('.md-source-file'));
        const footer = root?.querySelector('.md-source-file');
        return footer ? getComputedStyle(footer).display === 'none' : 'sem rodapé';
      });
    await expect.poll(footerHidden).toBe(true);

    // O TechDocs recria o conteúdo ao navegar (sem recarregar): as datas mudam junto e o rodapé
    // continua escondido
    await page.getByRole('link', { name: 'Processo de aprovação' }).first().click();
    await expect(page).toHaveURL(/processos\/aprovacao/);
    await expect(dates).toHaveText(format, { timeout: 30_000, useInnerText: true });
    await expect.poll(footerHidden).toBe(true);
  });
});

test.describe('problemas apontados pela pipeline', () => {
  test('marca o bloco no modo visual e "ver linha" marca a linha no Markdown', async ({ page }) => {
    const github = new FakeGitHub();
    github.nextOutcome = {
      'Formatação do texto': {
        conclusion: 'failure',
        annotations: [{ path: FILE, line: 3, message: `${FILE}:3 MD009/no-trailing-spaces Trailing spaces` }],
      },
    };
    await openEditor(page, github);
    await typeAfter(page, ANCHOR, ' Um.');
    await waitForPending(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Precisa de ajustes');

    await expect(page.getByText('Linha 3: há espaços sobrando no fim da linha')).toBeVisible();
    // Marca vermelha (●) no número de linha do bloco, no modo visual
    await expect(page.locator('span', { hasText: /^● 3$/ })).toBeVisible();
    await page.getByRole('button', { name: 'ver linha' }).first().click();
    await expect(mode(page, 'Markdown')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.cm-lint-marker-error')).toHaveCount(1);
  });
});

test.describe('configuração do lint vem do repositório', () => {
  test('regra desligada no .markdownlint.yaml da wiki não é apontada no editor', async ({ page }) => {
    const files = wikiFiles();
    files['.markdownlint.yaml'] += 'MD025: false\n';
    const github = new FakeGitHub(files);
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Título 1', 'Outro título 1');
    await waitForPending(page);
    // Com a regra ligada aparecia "há mais de um Título 1"; desligada no repositório, nada
    await page.waitForTimeout(1_000);
    await expect(page.getByTestId('lint-auto-fixed')).toHaveCount(0);
    await expect(page.getByTestId('lint-problems')).toHaveCount(0);
  });
});

test.describe('falhas do GitHub', () => {
  test('erro ao salvar aparece na tela, o texto continua no editor e salvar de novo funciona', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await typeAfter(page, ANCHOR, ' Um.');
    await waitForPending(page);
    github.failNext('PUT', /contents\/docs\/guias/, 500, 'Erro interno do GitHub');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(page.getByText('Erro interno do GitHub')).toBeVisible();
    await expect(status(page)).toHaveText('Alterações não salvas');
    await expect(editor(page)).toContainText('Experimente editá-la! Um.');

    await panelButton(page, 'Salvar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho salvo');
    expect(github.file(FILE, BRANCH)).toContain('Experimente editá-la! Um.');
  });

  test('erro ao abrir o editor: mensagem clara em vez de tela em branco', async ({ page }) => {
    const github = new FakeGitHub();
    github.failNext('GET', /^\/repos\/[^/]+\/[^/]+$/, 500, 'GitHub fora do ar');
    await github.install(page);
    await enterPortal(page);
    await page.goto(`/docs-editor?${new URLSearchParams({ entity: 'component:default/wiki-demo', page: 'guias/primeiros-passos' })}`);
    await expect(page.getByText('Não foi possível abrir o editor')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('GitHub fora do ar')).toBeVisible();
  });

  test('página que não existe no repositório: mensagem com o caminho', async ({ page }) => {
    const github = new FakeGitHub();
    await github.install(page);
    await enterPortal(page);
    await page.goto(`/docs-editor?${new URLSearchParams({ entity: 'component:default/wiki-demo', page: 'nao/existe' })}`);
    await expect(page.getByText('Não encontrei o arquivo da página "nao/existe" em docs/')).toBeVisible({ timeout: 30_000 });
  });

  test('sem o login do GitHub configurado no portal: explica o que falta, sem abrir o popup', async ({ page }) => {
    const github = new FakeGitHub();
    github.signInMissing = true;
    await github.install(page);
    await enterPortal(page);
    const popups: string[] = [];
    page.on('popup', popup => popups.push(popup.url()));
    await page.goto(`/docs-editor?${new URLSearchParams({ entity: 'component:default/wiki-demo', page: 'guias/primeiros-passos' })}`);
    await expect(page.getByText('O login do GitHub não está configurado neste portal')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText('auth.providers.github')).toBeVisible();
    expect(popups).toEqual([]);
    // Nenhuma chamada ao GitHub: o editor para antes
    expect(github.calls).toEqual([]);
  });
});

test.describe('idiomas', () => {
  test('em inglês (escolha da pessoa nas configurações), o editor e o painel aparecem em inglês', async ({ page }) => {
    const github = new FakeGitHub();
    // O Backstage guarda o idioma escolhido em localStorage("language")
    await page.addInitScript(() => window.localStorage.setItem('language', 'en'));
    await openEditor(page, github);
    await expect(page.locator('.MuiChip-label').first()).toHaveText('No changes');
    await expect(page.getByRole('button', { name: 'History' })).toBeVisible();
    await expect(page.getByRole('button', { name: /^Save draft/ })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to the page' })).toBeVisible();
    // Menu "/" do editor visual também traduzido
    await editor(page).locator('p').first().click();
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('/');
    await expect(page.locator('.milkdown-slash-menu li:has(span:text-is("Code block"))')).toHaveCount(1);
  });
});

