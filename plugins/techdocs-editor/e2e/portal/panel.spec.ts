import { Page, expect, test } from '@playwright/test';
import { CHECK_NAMES, EXTERNAL_CHECK_NAMES, FakeGitHub, LOGIN, wikiFiles } from './fake-github';
import {
  ENTITY,
  editor,
  enterPortal,
  insertBlock,
  notice,
  openEditor,
  panelButton,
  setTabVisible,
  status,
  typeAfter,
  waitForPending,
} from './helpers';

/**
 * Painel do editor dentro do portal: os 4 botões (salvar rascunho, salvar e verificar, publicar,
 * descartar), o lint antes de verificar e o que cada ação faz no GitHub (simulado).
 */

const FILE = 'docs/guias/primeiros-passos.md';
const BRANCH = 'docs/pessoa-teste/docs-guias-primeiros-passos';
const ANCHOR = 'Experimente editá-la!';

/** Escreve uma frase nova no fim do primeiro parágrafo e espera o painel perceber. */
async function edit(page: Page, typed = ' Frase nova.') {
  await typeAfter(page, ANCHOR, typed);
  await waitForPending(page);
}

const expectEnabled = async (page: Page, enabled: Record<string, boolean>) => {
  for (const [name, on] of Object.entries(enabled)) {
    const button = panelButton(page, name as Parameters<typeof panelButton>[1]);
    if (on) await expect(button, name).toBeEnabled();
    else await expect(button, name).toBeDisabled();
  }
};

test.describe('estado inicial', () => {
  test('sem alterações: os botões ficam desligados; sem Descartar', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await expect(status(page)).toHaveText('Sem alterações');
    await expectEnabled(page, { 'Salvar rascunho': false, 'Salvar e verificar': false, 'Enviar para publicação': false });
    await expect(panelButton(page, 'Descartar rascunho')).toHaveCount(0);
  });

  test('cada botão tem dica ao passar o mouse', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    const tips = {
      'Salvar rascunho': /só guarda o que foi editado, sem verificar/,
      'Salvar e verificar': /confere a formatação e roda as verificações/,
      'Enviar para publicação': /abre o pull request; a página é publicada quando o merge for feito no GitHub/,
    } as const;
    for (const [name, text] of Object.entries(tips)) {
      // O invólucro do botão recebe o mouse mesmo com o botão desligado (é o que mostra a dica)
      await panelButton(page, name as keyof typeof tips).locator('xpath=..').hover();
      await expect(page.getByRole('tooltip')).toHaveText(text);
      await page.mouse.move(0, 0);
      await expect(page.getByRole('tooltip')).toHaveCount(0);
    }
  });

  test('com alteração: os dois salvar ligados; enviar só depois de Salvar e verificar', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await expectEnabled(page, { 'Salvar rascunho': true, 'Salvar e verificar': true, 'Enviar para publicação': false });
    await expect(panelButton(page, 'Enviar para publicação')).toHaveAttribute('aria-label', /salve e verifique antes de enviar/);
  });

  test('sem permissão de escrita no GitHub: avisa e não abre o editor', async ({ page }) => {
    const github = new FakeGitHub();
    github.canWrite = false;
    await github.install(page);
    await enterPortal(page);
    await page.goto(`/docs-editor?${new URLSearchParams({ entity: ENTITY, page: 'guias/primeiros-passos' })}`);
    await expect(page.getByText('Você não tem permissão para editar esta documentação')).toBeVisible();
    await expect(editor(page)).toHaveCount(0);
  });

  test('/docs-editor sem página lista as documentações e abre a escolhida', async ({ page }) => {
    const github = new FakeGitHub();
    await github.install(page);
    await enterPortal(page);
    await page.goto('/docs-editor');
    await expect(page.getByRole('heading', { name: 'Editar documentação' })).toBeVisible();
    await page.getByText('Wiki de Demonstração').click();
    await expect(editor(page).locator('h1')).toHaveText('Wiki de Demonstração');
  });
});

test.describe('Salvar rascunho', () => {
  test('só guarda: commit [skip ci], sem PR e sem pipeline', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();

    await expect(notice(page)).toContainText('Rascunho salvo');
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.file(FILE, BRANCH)).toContain('Experimente editá-la! Frase nova.');
    const commits = github.branchCommits(BRANCH);
    expect(commits).toHaveLength(1);
    expect(commits[0].message).toContain('[skip ci]');
    expect(github.pulls).toHaveLength(0);
    expect(github.pipelineRuns).toHaveLength(0);
    // main intacta
    expect(github.file(FILE)).not.toContain('Frase nova');
    // Rascunho só guardado não pode ser enviado: falta verificar
    await expectEnabled(page, { 'Salvar rascunho': false, 'Salvar e verificar': true, 'Enviar para publicação': false });
    await expect(panelButton(page, 'Descartar rascunho')).toBeEnabled();
  });

  test('não passa pelo lint: guarda mesmo com problema de formatação', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    // Título repetido: o lint aponta (MD024) e não tem correção automática
    await insertBlock(page, ANCHOR, 'Título 2', 'Antes de começar');
    await waitForPending(page);
    await expect(page.getByTestId('lint-problems')).toBeVisible();
    await expectEnabled(page, { 'Salvar rascunho': true, 'Salvar e verificar': false, 'Enviar para publicação': false });
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.file(FILE, BRANCH)).toMatch(/## Antes de começar[\s\S]*## Antes de começar/);
    expect(github.pipelineRuns).toHaveLength(0);
  });

  test('reabrir a página retoma o rascunho salvo, como não verificado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');

    await page.reload();
    await expect(editor(page)).toContainText('Frase nova.');
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
  });

  test('salvar de novo acrescenta outro commit [skip ci]', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page, ' Um.');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    await edit(page, ' Dois.');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.branchCommits(BRANCH).map(c => c.message.includes('[skip ci]'))).toEqual([true, true]);
    expect(github.file(FILE, BRANCH)).toContain('editá-la! Um. Dois.');
  });
});

test.describe('Salvar e verificar', () => {
  test('direto, sem rascunho: commit normal, PR em rascunho e uma execução da pipeline', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();

    await expect(notice(page)).toContainText(/verificações automáticas começaram/i);
    const commits = github.branchCommits(BRANCH);
    expect(commits).toHaveLength(1);
    expect(commits[0].message).not.toContain('[skip ci]');
    expect(github.pulls).toHaveLength(1);
    expect(github.openPull()!.draft).toBe(true);
    expect(github.pipelineRuns).toEqual([commits[0].sha]);
    // As 4 verificações aparecem no painel
    for (const name of CHECK_NAMES) await expect(page.getByText(name, { exact: true })).toBeVisible();
    await expect(status(page)).toHaveText('Rascunho');
  });

  test('depois de Salvar rascunho, sem edição nova: commit vazio dispara a pipeline', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');

    await panelButton(page, 'Salvar e verificar').click();
    await expect(notice(page)).toContainText(/verificações automáticas começaram/i);
    const commits = github.branchCommits(BRANCH);
    expect(commits).toHaveLength(2);
    expect(commits[1].message).not.toContain('[skip ci]');
    expect(commits[1].tree).toBe(commits[0].tree);
    expect(github.pipelineRuns).toEqual([commits[1].sha]);
    await expect(status(page)).toHaveText('Rascunho');
    await expectEnabled(page, { 'Salvar e verificar': false });
  });

  test('rascunho salvo com PR aberto: verificações antigas somem até verificar de novo', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page, ' Um.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByText('Links', { exact: true })).toBeVisible();

    await edit(page, ' Dois.');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    await expect(page.getByText('Há alterações salvas depois da última verificação')).toBeVisible();
    await expect(page.getByText('Links', { exact: true })).toHaveCount(0);
    expect(github.pipelineRuns).toHaveLength(1);

    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByText('Links', { exact: true })).toBeVisible();
    expect(github.pipelineRuns).toHaveLength(2);
  });

  test('ajusta sozinho o que tem correção automática (seção como Título 1)', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Título 1', 'Seção nova');
    await waitForPending(page);
    const autoFixed = page.getByTestId('lint-auto-fixed');
    await expect(autoFixed).toContainText('há mais de um Título 1 na página');
    await expectEnabled(page, { 'Salvar e verificar': true });

    await panelButton(page, 'Salvar e verificar').click();
    await expect(notice(page)).toContainText('Ajustamos a formatação automaticamente');
    expect(github.file(FILE, BRANCH)).toContain('\n## Seção nova\n');
    expect(github.file(FILE, BRANCH)).not.toContain('\n# Seção nova\n');
    // O editor passa a mostrar o texto ajustado
    await expect(editor(page).locator('h2', { hasText: 'Seção nova' })).toBeVisible();
    await expect(autoFixed).toHaveCount(0);
  });

  test('"Ajustar agora" corrige no editor antes de verificar', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Título 4', 'Pula nível');
    await waitForPending(page);
    await page.getByRole('button', { name: 'Ajustar agora' }).click();
    await expect(editor(page).locator('h2', { hasText: 'Pula nível' })).toBeVisible();
    await expect(page.getByTestId('lint-auto-fixed')).toHaveCount(0);
    expect(github.calls.filter(c => c.startsWith('PUT'))).toHaveLength(0);
  });

  test('problema sem correção automática trava verificar e publicar, com a linha', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await insertBlock(page, ANCHOR, 'Título 2', 'Antes de começar');
    await waitForPending(page);
    const problems = page.getByTestId('lint-problems');
    await expect(problems).toContainText('1 problema de formatação');
    // O título repetido é o que já existia (linha 7), que vem depois do novo
    await expect(problems).toContainText('Linha 7: há dois títulos com o mesmo texto');
    await expectEnabled(page, { 'Salvar e verificar': false, 'Enviar para publicação': false });

    // "ver linha" abre a visão Markdown
    await problems.getByRole('button', { name: 'ver linha' }).click();
    await expect(page.getByRole('button', { name: 'Markdown', pressed: true })).toBeVisible();
  });
});

test.describe('Enviar para publicação / Enviar para revisão', () => {
  test('abre o PR pronto para revisão, mostra o link e não faz merge', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByText('Links', { exact: true })).toBeVisible();

    await panelButton(page, 'Enviar para publicação').click();
    const pr = github.openPull()!;
    await expect(notice(page)).toContainText(new RegExp(`Pull request #${pr.number}.* aberto`));
    await expect(notice(page).getByRole('link', { name: `#${pr.number}` })).toHaveAttribute(
      'href',
      `https://github.com/edtroleis/docs-editor-wiki-demo/pull/${pr.number}`,
    );
    await expect(status(page)).toHaveText('Aguardando publicação');
    await expect(page.getByTestId('pr-link')).toContainText(`Ver o pull request #${pr.number} no GitHub`);
    expect(pr.draft).toBe(false);
    expect(pr.autoMerge).toBe(false);
    expect(pr.mergedAt).toBeUndefined();
    expect(github.file(FILE)).not.toContain('Frase nova');
    expect(github.calls.some(c => c.includes('/merge'))).toBe(false);
  });

  test('enviar só fica ligado para o que passou por Salvar e verificar', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    const send = panelButton(page, 'Enviar para publicação');
    await expect(send).toBeDisabled();

    await edit(page, ' Um.');
    await expect(send).toBeDisabled();
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    await expect(send).toBeDisabled();

    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(send).toBeEnabled();

    // Editou depois de verificar: desliga até verificar de novo
    await edit(page, ' Dois.');
    await expect(send).toBeDisabled();
    await expect(send).toHaveAttribute('aria-label', /salve e verifique antes de enviar/);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    await expect(send).toBeDisabled();
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(send).toBeEnabled();

    await send.click();
    await expect(notice(page)).toContainText(/Pull request #1.* aberto/);
    // Enviar não salva nem roda nada de novo: só tira o PR de rascunho
    expect(github.pipelineRuns).toHaveLength(2);
    expect(github.pulls[0].draft).toBe(false);
    expect(github.pulls[0].mergedAt).toBeUndefined();
    await expect(send).toBeDisabled();
  });

  test('o merge feito no GitHub aparece como Publicado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');

    github.mergeOnGitHub(github.openPull()!);
    // O painel consulta o GitHub a cada poucos segundos
    await expect(status(page)).toHaveText('Publicado', { timeout: 30_000 });
    await expect(page.getByText('Ver a página publicada')).toBeVisible();
  });

  test('com aprovação exigida: o botão vira Enviar para revisão e o PR espera', async ({ page }) => {
    const github = new FakeGitHub();
    github.requiredApprovals = 1;
    await openEditor(page, github);
    await edit(page);
    await expect(panelButton(page, 'Enviar para publicação')).toHaveCount(0);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para revisão').hover();
    await expect(page.getByRole('tooltip')).toContainText('abre o pull request para aprovação');
    await panelButton(page, 'Enviar para revisão').click();

    await expect(notice(page)).toContainText('aberto para revisão');
    await expect(status(page)).toHaveText('Em revisão');
    const pr = github.openPull()!;
    expect(pr.draft).toBe(false);
    expect(pr.mergedAt).toBeUndefined();
  });

  test('verificação falhando: mostra o problema e trava o envio até corrigir', async ({ page }) => {
    const github = new FakeGitHub();
    github.nextOutcome = {
      Links: {
        conclusion: 'failure',
        annotations: [{ path: FILE, line: 3, message: 'docs/guias/primeiros-passos.md:3 Link quebrado: inexistente.md' }],
      },
    };
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();

    await expect(status(page)).toHaveText('Precisa de ajustes');
    await expect(page.getByText('Há links que não funcionam.')).toBeVisible();
    await expect(page.getByText(/Linha 3:.*Link quebrado: inexistente\.md/)).toBeVisible();
    await expectEnabled(page, { 'Enviar para publicação': false, 'Salvar e verificar': true });

    // Corrige, verifica de novo (a próxima execução passa) e envia
    await edit(page, ' Corrigido.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
  });
});

test.describe('PR aberto de outra pessoa na mesma página', () => {
  test('o editor avisa e mostra o link', async ({ page }) => {
    const github = new FakeGitHub();
    const other = github.openPullFromOther('outra-pessoa', FILE, '# Primeiros passos\n\nOutra edição.\n');
    await openEditor(page, github);
    const alert = page.getByTestId('others-prs');
    await expect(alert).toContainText('Esta página tem alterações de outras pessoas aguardando publicação');
    await expect(alert.getByRole('link', { name: `pull request #${other.number}` })).toHaveAttribute(
      'href',
      `https://github.com/edtroleis/docs-editor-wiki-demo/pull/${other.number}`,
    );
    await expect(alert).toContainText('(outra-pessoa)');
  });

  test('PR de outra página não gera aviso; o próprio PR também não', async ({ page }) => {
    const github = new FakeGitHub();
    github.openPullFromOther('outra-pessoa', 'docs/index.md', '# Wiki\n\nOutra página.\n');
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await page.reload();
    await expect(editor(page)).toBeVisible({ timeout: 30_000 });
    await expect(status(page)).toHaveText('Rascunho');
    await expect(page.getByTestId('others-prs')).toHaveCount(0);
  });

  test('na página da documentação, quem pode editar vê o aviso com o link', async ({ page }) => {
    const github = new FakeGitHub();
    const other = github.openPullFromOther('outra-pessoa', FILE, '# Primeiros passos\n\nOutra edição.\n');
    await github.install(page);
    await enterPortal(page);
    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    const indicator = page.getByRole('link', { name: 'Há 1 alteração desta página aguardando publicação' });
    await expect(indicator).toBeVisible({ timeout: 30_000 });
    await expect(indicator).toHaveAttribute('href', `https://github.com/edtroleis/docs-editor-wiki-demo/pull/${other.number}`);
    await expect(async () => {
      await page.mouse.move(0, 0);
      await indicator.hover();
      await expect(page.getByRole('tooltip')).toContainText(`pull request #${other.number} (outra-pessoa)`, { timeout: 2_000 });
    }).toPass();
  });

  test('sem acesso de edição: nem lápis nem aviso; sem login do GitHub: lápis para o owner, sem aviso', async ({ browser }) => {
    const pencil = (page: Page) => page.getByRole('button', { name: 'Editar esta página' });
    const docPage = '/docs/default/component/wiki-demo/guias/primeiros-passos/';
    const open = async (setup: (g: FakeGitHub) => void) => {
      const page = await browser.newPage();
      const github = new FakeGitHub();
      setup(github);
      github.openPullFromOther('outra-pessoa', FILE, '# Primeiros passos\n\nOutra edição.\n');
      await github.install(page);
      await enterPortal(page);
      await page.goto(docPage);
      // A página carregou (engrenagem do TechDocs) e a consulta de acesso teve tempo de terminar
      await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible({ timeout: 30_000 });
      await page.waitForTimeout(3_000);
      return { page, github };
    };

    // Login do GitHub feito, sem permissão de escrita no repositório
    const reader = await open(g => (g.canWrite = false));
    await expect(pencil(reader.page)).toHaveCount(0);
    await expect(reader.page.getByRole('link', { name: /aguardando publicação/ })).toHaveCount(0);
    await reader.page.close();

    // Sem login do GitHub: o guest é do grupo owner da wiki (guests), então vê o lápis; o aviso de
    // PRs precisa do GitHub e não aparece. Nenhum popup do GitHub só por ler a página
    const owner = await open(g => (g.signedIn = false));
    await expect(pencil(owner.page)).toBeVisible();
    await expect(owner.page.getByRole('link', { name: /aguardando publicação/ })).toHaveCount(0);
    await expect(owner.page.getByText('Login Required')).toHaveCount(0);
    expect(owner.github.calls).toEqual([]);
    await owner.page.close();
  });

  test('sem login do GitHub e sem ser owner da documentação: sem lápis', async ({ page }) => {
    const github = new FakeGitHub();
    github.signedIn = false;
    await github.install(page);
    // A wiki passa a ser de outro time no catálogo
    await page.route('**/api/catalog/entities/by-name/component/default/wiki-demo', async route => {
      const entity = await (await route.fetch()).json();
      entity.spec.owner = 'group:default/outro-time';
      entity.relations = entity.relations.map((r: { type: string; targetRef: string }) =>
        r.type === 'ownedBy' ? { ...r, targetRef: 'group:default/outro-time' } : r,
      );
      await route.fulfill({ json: entity });
    });
    await enterPortal(page);
    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    await expect(page.getByRole('button', { name: 'Editar esta página' })).toHaveCount(0);
  });
});

test.describe('verificações antigas não aparecem depois de salvar', () => {
  test('ao verificar de novo, a lista some na hora e só volta com o resultado do commit novo', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page, ' Um.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(page.getByText('Links', { exact: true })).toBeVisible();

    // Como no GitHub: o PR demora a apontar para o commit novo e a pipeline demora a começar.
    // A próxima execução reprova "Links": se o painel mostrar tudo verde, são as verificações antigas
    github.prHeadLag = 2;
    github.pipelineStartDelay = 2;
    github.nextOutcome = { Links: { conclusion: 'failure' } };
    await edit(page, ' Dois.');
    // Depois do clique, registra cada vez que a lista aparece com as 4 verificações aprovadas (só a
    // antiga é assim; antes do clique ela ainda vale, é o resultado do salvamento anterior)
    await page.evaluate(() => {
      (window as any).staleSeen = 0;
      let armed = false;
      document.addEventListener('click', e => {
        if ((e.target as Element).closest('[aria-label^="Salvar e verificar"]')) armed = true;
      }, true);
      new MutationObserver(() => {
        if (!armed) return;
        const items = [...document.querySelectorAll('li')].filter(li =>
          ['Formatação do texto', 'Links', 'Dados sensíveis', 'Montagem da documentação'].includes(li.textContent?.trim() ?? ''),
        );
        if (items.length === 4 && !document.body.textContent?.includes('Há links que não funcionam')) {
          (window as any).staleSeen++;
        }
      }).observe(document.body, { childList: true, subtree: true });
    });
    await panelButton(page, 'Salvar e verificar').click();
    await expect(notice(page)).toContainText(/verificações automáticas começaram/i);
    await expect(page.getByText('Iniciando… (o GitHub leva alguns segundos para começar)')).toBeVisible();
    await expect(status(page)).toHaveText('Precisa de ajustes', { timeout: 60_000 });
    expect(await page.evaluate(() => (window as any).staleSeen), 'lista antiga (toda verde) apareceu').toBe(0);
    await expect(page.getByText('Há links que não funcionam.')).toBeVisible();
  });

  test('problema apontado pela verificação anterior some ao salvar de novo', async ({ page }) => {
    const github = new FakeGitHub();
    github.nextOutcome = {
      Links: { conclusion: 'failure', annotations: [{ path: FILE, line: 3, message: 'docs/guias/primeiros-passos.md:3 Link quebrado' }] },
    };
    await openEditor(page, github);
    await edit(page, ' Um.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByText(/Linha 3:.*Link quebrado/)).toBeVisible();

    github.pipelineStartDelay = 2;
    await edit(page, ' Dois.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByText(/Link quebrado/)).toHaveCount(0);
    await expect(page.getByText('Há links que não funcionam.')).toHaveCount(0);
    await expect(status(page)).toHaveText('Rascunho', { timeout: 60_000 });
  });
});

test.describe('repositório sem pipeline', () => {
  test('a verificação é o lint do editor: o painel explica e o envio fica liberado', async ({ page }) => {
    const github = new FakeGitHub();
    github.hasPipeline = false;
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(page.getByTestId('no-pipeline')).toContainText('Este repositório não tem verificações automáticas');
    await expect(page.getByTestId('checks-waiting')).toHaveCount(0);
    await expect(panelButton(page, 'Enviar para publicação')).toBeEnabled();
    expect(github.pipelineRuns).toHaveLength(0);
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
  });
});

test.describe('pipeline de qualquer CI', () => {
  const JENKINS = EXTERNAL_CHECK_NAMES[0];

  test('CI externo (Jenkins) com commit status e checks obrigatórios na proteção clássica: verifica e trava o envio', async ({ page }) => {
    const github = new FakeGitHub();
    github.pipelineKind = 'external';
    github.classicRequiredChecks = [JENKINS];
    github.nextOutcome = { [JENKINS]: { conclusion: 'failure' } };
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();

    // Sem workflow do GitHub Actions, o modo automático vê a pipeline pelos checks obrigatórios
    await expect(status(page)).toHaveText('Precisa de ajustes');
    await expect(page.getByTestId('no-pipeline')).toHaveCount(0);
    await expect(page.getByText(JENKINS)).toBeVisible();
    await expect(page.getByRole('link', { name: 'ver detalhes' })).toHaveAttribute('href', /jenkins\.example\.com/);
    await expectEnabled(page, { 'Enviar para publicação': false });

    await edit(page, ' Corrigido.');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
  });

  test('.techdocs-editor.yaml do repositório: modo pipeline e mensagem do job, valendo sobre o portal', async ({ page }) => {
    const github = new FakeGitHub();
    github.pipelineKind = 'external';
    github.publishOnMain(
      '.techdocs-editor.yaml',
      `verification:\n  mode: pipeline\n  checkHelp:\n    ${JENKINS}: O Jenkins do time encontrou um problema na página.\n    Links: Mensagem do repositório para Links.\n`,
    );
    github.nextOutcome = { [JENKINS]: { conclusion: 'failure' } };
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();

    // Sem workflow nem checks obrigatórios, o automático usaria só o lint: vale o modo do repositório
    await expect(status(page)).toHaveText('Precisa de ajustes');
    await expect(page.getByText('O Jenkins do time encontrou um problema na página.')).toBeVisible();
  });

  test('.techdocs-editor.yaml: tempo próprio para o CI começar', async ({ page }) => {
    const github = new FakeGitHub();
    github.pipelineKind = 'external';
    github.classicRequiredChecks = [JENKINS];
    // O CI nunca começa; no portal o aviso viria só depois de 120 s
    github.pipelineStartDelay = 1000;
    github.publishOnMain('.techdocs-editor.yaml', 'verification:\n  startTimeoutSeconds: 1\n');
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(page.getByTestId('checks-waiting')).toContainText('O GitHub não iniciou nenhuma verificação', { timeout: 30_000 });
  });
});

test.describe('permissão do Backstage', () => {
  /** A política do portal nega `techdocs-editor.page.edit` (o GitHub permitiria a escrita). */
  const denyEdit = (page: Page) =>
    page.route('**/api/permission/authorize', async route => {
      const { items } = route.request().postDataJSON() as { items: Array<{ id: string; permission: { name: string } }> };
      await route.fulfill({
        json: {
          items: items.map(i => ({ id: i.id, result: i.permission.name === 'techdocs-editor.page.edit' ? 'DENY' : 'ALLOW' })),
        },
      });
    });

  test('negada: o editor não abre e a página da doc não mostra o lápis', async ({ page }) => {
    const github = new FakeGitHub();
    await denyEdit(page);
    await github.install(page);
    await enterPortal(page);
    await page.goto(`/docs-editor?${new URLSearchParams({ entity: ENTITY, page: 'guias/primeiros-passos' })}`);
    await expect(page.getByText('Você não tem permissão para editar esta documentação')).toBeVisible({ timeout: 30_000 });
    await expect(editor(page)).toHaveCount(0);

    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    await expect(page.getByTestId('page-dates')).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: 'Editar esta página' })).toHaveCount(0);
  });
});

test.describe('PR próprio aberto fora do editor', () => {
  test('o aviso diz que é seu e como cancelar, sem tratar como de outra pessoa', async ({ page }) => {
    const github = new FakeGitHub();
    const own = github.openPullFromOther(LOGIN, FILE, '# Primeiros passos\n\nPelo terminal.\n', 'docs/guia-pelo-terminal');
    await openEditor(page, github);
    const alert = page.getByTestId('own-prs');
    await expect(alert).toContainText('Você tem uma alteração desta página aberta no GitHub, feita fora deste editor');
    await expect(alert).toContainText('feche o pull request no GitHub');
    await expect(alert.getByRole('link', { name: `pull request #${own.number}` })).toBeVisible();
    await expect(page.getByTestId('others-prs')).toHaveCount(0);
  });

  test('PR seu fora do editor e PR de outra pessoa: um aviso para cada', async ({ page }) => {
    const github = new FakeGitHub();
    github.openPullFromOther(LOGIN, FILE, '# Primeiros passos\n\nPelo terminal.\n', 'docs/guia-pelo-terminal');
    github.openPullFromOther('outra-pessoa', FILE, '# Primeiros passos\n\nOutra edição.\n');
    await openEditor(page, github);
    await expect(page.getByTestId('own-prs').getByRole('link', { name: 'pull request #1' })).toBeVisible();
    const others = page.getByTestId('others-prs');
    await expect(others.getByRole('link', { name: 'pull request #2' })).toBeVisible();
    await expect(others).toContainText('(outra-pessoa)');
    await expect(others).not.toContainText('#1');
  });
});

test.describe('Histórico da página', () => {
  const V2 = '# Primeiros passos\n\nVersão 2 da página.\n';
  const openHistory = async (page: Page) => {
    await page.getByRole('button', { name: 'Histórico' }).click();
    const list = page.getByTestId('history-list');
    await expect(list).toBeVisible();
    return list.locator('li');
  };

  test('lista as versões publicadas, da mais nova para a mais antiga', async ({ page }) => {
    const github = new FakeGitHub();
    github.publishOnMain(FILE, V2);
    await openEditor(page, github);
    const versions = await openHistory(page);
    await expect(versions).toHaveCount(2);
    await expect(versions.first()).toContainText('publicada agora');
    await expect(versions.first()).toContainText(`docs: altera ${FILE}`);
    await expect(versions.last()).toContainText('docs: wiki de demonstração');
  });

  test('restaurar uma versão antiga: o texto vai para o editor e segue o fluxo normal', async ({ page }) => {
    const github = new FakeGitHub();
    const original = github.file(FILE)!;
    github.publishOnMain(FILE, V2);
    await openEditor(page, github);
    await expect(editor(page)).toContainText('Versão 2 da página');

    const versions = await openHistory(page);
    await versions.last().getByRole('button', { name: 'Restaurar' }).click();
    await expect(page.getByTestId('history-list')).toBeHidden();
    await expect(notice(page)).toContainText('restaurada no editor');
    await expect(editor(page)).toContainText(ANCHOR);
    await expect(editor(page)).not.toContainText('Versão 2 da página');
    await waitForPending(page);

    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.file(FILE, BRANCH)).toBe(original);
    expect(github.file(FILE)).toBe(V2);
  });

  test('restaurar a versão publicada desfaz o que não foi salvo', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await waitForPending(page);

    const versions = await openHistory(page);
    page.once('dialog', dialog => dialog.accept());
    await versions.first().getByRole('button', { name: 'Restaurar' }).click();
    await expect(notice(page)).toContainText('O editor já está com a versão de');
    await expect(editor(page)).not.toContainText('Frase nova');
    await expect(status(page)).toHaveText('Sem alterações');
  });

  test('token trocado pelo GitHub com o editor aberto: pega o novo da sessão e segue', async ({ page }) => {
    const github = new FakeGitHub();
    github.publishOnMain(FILE, V2);
    await openEditor(page, github);
    github.rotateToken();

    const versions = await openHistory(page);
    await expect(versions).toHaveCount(2);
    await expect(page.getByText('Bad credentials')).toHaveCount(0);
  });

  test('cancelar a confirmação mantém o texto não salvo', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await waitForPending(page);

    const versions = await openHistory(page);
    page.once('dialog', dialog => dialog.dismiss());
    await versions.first().getByRole('button', { name: 'Restaurar' }).click();
    await expect(page.getByTestId('history-list')).toBeVisible();
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect(editor(page)).toContainText('Frase nova');
    await expect(status(page)).toHaveText('Alterações não salvas');
  });
});

test.describe('Descartar rascunho', () => {
  test('apaga a branch, fecha o PR e volta ao texto publicado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');

    page.once('dialog', dialog => dialog.accept());
    await panelButton(page, 'Descartar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho descartado');
    expect(github.refs.has(BRANCH)).toBe(false);
    expect(github.pulls[0].state).toBe('closed');
    await expect(editor(page)).not.toContainText('Frase nova');
    await expect(status(page)).toHaveText('Sem alterações');
    await expect(panelButton(page, 'Descartar rascunho')).toHaveCount(0);
  });

  test('rascunho só salvo (sem PR) também é descartado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');

    page.once('dialog', dialog => dialog.accept());
    await panelButton(page, 'Descartar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho descartado');
    expect(github.refs.has(BRANCH)).toBe(false);
    await expect(status(page)).toHaveText('Sem alterações');
  });

  test('cancelar a confirmação não apaga nada', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');

    page.once('dialog', dialog => dialog.dismiss());
    await panelButton(page, 'Descartar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.refs.has(BRANCH)).toBe(true);
  });
});

test.describe('consultas ao GitHub (escala)', () => {
  const pullCalls = (github: FakeGitHub) => github.calls.filter(c => /^GET \/repos\/.+\/pulls\/\d+$/.test(c)).length;

  test('aba em segundo plano: nenhuma consulta; ao voltar, consulta na hora', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');

    await setTabVisible(page, false);
    const before = github.calls.length;
    // Mais que o intervalo de 8 s que valeria com a aba à vista
    await page.waitForTimeout(10_000);
    expect(github.calls.slice(before)).toEqual([]);

    github.mergeOnGitHub(github.openPull()!);
    await setTabVisible(page, true);
    await expect(status(page)).toHaveText('Publicado', { timeout: 3_000 });
  });

  test('verificações terminadas no rascunho: as consultas ficam espaçadas', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(page.getByText(CHECK_NAMES[0])).toBeVisible();

    const before = pullCalls(github);
    await page.waitForTimeout(10_000);
    // Com check rodando seria uma consulta a cada 8 s; parado, a próxima é em 60 s
    expect(pullCalls(github)).toBe(before);
  });

  test('esperando publicação: consulta a cada poucos segundos e, sem mudança, o GitHub responde 304', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');

    const pr = github.openPull()!;
    await expect
      .poll(() => github.notModified.filter(c => c.endsWith(`/pulls/${pr.number}`)).length, { timeout: 20_000 })
      .toBeGreaterThan(0);
    // O 304 devolve a resposta anterior: o painel continua igual
    await expect(status(page)).toHaveText('Aguardando publicação');
  });
});

test.describe('Configurar verificações (setup do repositório)', () => {
  const setupCard = (page: Page) => page.getByTestId('repo-setup');

  /** Repositório cru: sem pipeline, sem regras do lint, sem ruleset e com merge comum liberado. */
  function bareRepo() {
    const files = wikiFiles();
    delete files['.markdownlint.yaml'];
    const github = new FakeGitHub(files);
    github.isAdmin = true;
    github.hasPipeline = false;
    github.hasRuleset = false;
    github.mergeSettings.allow_merge_commit = true;
    return github;
  }

  test('admin de repositório cru: lista o que falta e configura (merge e ruleset na hora, arquivos num PR)', async ({ page }) => {
    const github = bareRepo();
    await openEditor(page, github);

    await expect(setupCard(page).locator('li')).toHaveText([
      'verificações automáticas nos pull requests',
      'arquivo com as regras de formatação',
      'merge por squash com a mensagem do pull request',
      'proteção da branch principal (mudança só por pull request verificado)',
    ]);
    // O escopo `workflow` (criar o arquivo do workflow) só é pedido ao configurar
    expect(github.requestedScopes.some(scope => scope.includes('workflow'))).toBe(false);
    page.once('dialog', dialog => dialog.accept());
    await setupCard(page).getByRole('button', { name: 'Configurar verificações' }).click();

    await expect(page.getByTestId('repo-setup-done')).toContainText('Repositório configurado. Os arquivos novos estão no pull request');
    expect(github.requestedScopes.some(scope => scope.split(' ').includes('workflow'))).toBe(true);
    // Não oferece de novo: o que falta está no PR
    await expect(setupCard(page).getByRole('button', { name: 'Configurar verificações' })).toHaveCount(0);

    expect(github.mergeSettings).toMatchObject({ allow_merge_commit: false, squash_merge_commit_message: 'PR_BODY' });
    expect(github.rulesets).toHaveLength(1);
    // O workflow ainda não está na main: exigir os checks travaria os PRs
    expect(github.rulesets[0].rules.map(r => r.type)).toEqual(['deletion', 'non_fast_forward', 'pull_request']);
    const pr = github.pulls.find(p => p.head === 'techdocs-editor/setup')!;
    expect(pr).toMatchObject({ draft: false, title: 'Configurar as verificações do editor de docs' });
    expect(github.file('.github/workflows/techdocs-checks.yml', pr.head)).toContain(`name: ${CHECK_NAMES[0]}`);
    expect(github.file('.markdownlint.yaml', pr.head)).toContain('MD013: false');
    // Nada vai direto para a main
    expect(github.file('.github/workflows/techdocs-checks.yml')).toBeUndefined();
  });

  test('cancelar a confirmação não muda nada', async ({ page }) => {
    const github = bareRepo();
    await openEditor(page, github);
    page.once('dialog', dialog => dialog.dismiss());
    await setupCard(page).getByRole('button', { name: 'Configurar verificações' }).click();

    await expect(setupCard(page).getByRole('button', { name: 'Configurar verificações' })).toBeEnabled();
    expect(github.calls.filter(c => !c.startsWith('GET '))).toEqual([]);
  });

  test('repositório já configurado (como a wiki da demo): sem aviso, mesmo para admin', async ({ page }) => {
    const github = new FakeGitHub();
    github.isAdmin = true;
    await openEditor(page, github);
    // O planejamento do setup rodou (só ele procura o workflow do setup)
    await expect.poll(() => github.calls.some(c => c.endsWith('/contents/.github/workflows/techdocs-checks.yml'))).toBe(true);
    await page.waitForTimeout(1_000);
    await expect(setupCard(page)).toHaveCount(0);
  });

  test('quem não é admin não vê o aviso nem consulta o setup', async ({ page }) => {
    const github = bareRepo();
    github.isAdmin = false;
    await openEditor(page, github);
    await page.waitForTimeout(1_000);
    await expect(setupCard(page)).toHaveCount(0);
    expect(github.calls.filter(c => c.includes('.github/workflows'))).toEqual([]);
  });
});

test.describe('situações de borda', () => {
  test('alterações não salvas são recuperadas ao reabrir', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await page.reload();
    await expect(page.getByText('Recuperamos alterações que você ainda não tinha salvado.')).toBeVisible();
    await expect(editor(page)).toContainText('Frase nova.');
    await expect(status(page)).toHaveText('Alterações não salvas');
  });

  test('a página mudou no GitHub enquanto editava: mensagem clara, nada sobrescrito', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page, ' Um.');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');

    // Outra pessoa (ou outra aba) muda o arquivo no rascunho
    github.commitOutside(BRANCH, FILE, '# Primeiros passos\n\nOutra versão.\n');
    await edit(page, ' Dois.');
    await panelButton(page, 'Salvar rascunho').click();
    // Não pode gravar por cima da versão mais nova: o GitHub recusa e a pessoa vê o que fazer
    await expect(page.getByText('Esta página mudou enquanto você editava.')).toBeVisible();
    expect(github.file(FILE, BRANCH)).toBe('# Primeiros passos\n\nOutra versão.\n');
  });

  test('nenhuma chamada fora do que o GitHub simulado conhece', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
    expect(github.calls.filter(c => c.startsWith('NÃO SIMULADO'))).toEqual([]);
  });
});

test.describe('na página da documentação', () => {
  test('o lápis ao lado da engrenagem tem a dica "Editar" e abre o editor da página', async ({ page }) => {
    const github = new FakeGitHub();
    await github.install(page);
    await enterPortal(page);
    await page.goto('/docs/default/component/wiki-demo/guias/primeiros-passos/');
    const pencil = page.getByRole('button', { name: 'Editar esta página' });
    // A página do TechDocs remonta o botão quando o conteúdo carrega: passa o mouse de novo se precisar
    await expect(async () => {
      await page.mouse.move(0, 0);
      await pencil.hover();
      await expect(page.getByRole('tooltip')).toHaveText('Editar', { timeout: 2_000 });
    }).toPass();
    await pencil.click();
    await expect(editor(page).locator('h1')).toHaveText('Primeiros passos');
  });

  test('com rascunho salvo, o lápis ganha um ponto e a dica "Continuar edição"; enviado, o ponto some', async ({ page }) => {
    test.setTimeout(180_000); // abre a página da doc três vezes
    const github = new FakeGitHub();
    // Dentro do TechDocs as classes do MUI ganham sufixo (MuiBadge-dot-586)
    const dot = page.getByTestId('draft-dot').locator('[class*="MuiBadge-dot"]');
    const pencil = page.getByRole('button', { name: 'Editar esta página' });
    const docPage = '/docs/default/component/wiki-demo/guias/primeiros-passos/';

    // Sem rascunho: sem ponto
    await github.install(page);
    await enterPortal(page);
    await page.goto(docPage);
    await expect(pencil).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(3_000);
    await expect(dot).toHaveClass(/MuiBadge-invisible/);

    // Rascunho salvo (só a branch, sem PR): ponto e dica
    await pencil.click();
    await expect(editor(page)).toBeVisible({ timeout: 30_000 });
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho salvo');
    await page.goto(docPage);
    await expect(dot).not.toHaveClass(/MuiBadge-invisible/, { timeout: 30_000 });
    await expect(async () => {
      await page.mouse.move(0, 0);
      await pencil.hover();
      await expect(page.getByRole('tooltip')).toHaveText('Continuar edição: você tem um rascunho desta página', { timeout: 2_000 });
    }).toPass();
    // Um único jeito de editar: o lápis (o ícone "editar no GitHub" do MkDocs fica escondido)
    await expect(page.getByRole('link', { name: /aguardando publicação/ })).toHaveCount(0);

    // Enviado para publicação: deixa de ser rascunho; vira alteração aguardando publicação
    await pencil.click();
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
    await page.goto(docPage);
    await expect(page.getByRole('link', { name: 'Há 1 alteração desta página aguardando publicação' })).toBeVisible({ timeout: 30_000 });
    await expect(dot).toHaveClass(/MuiBadge-invisible/);
  });
});
