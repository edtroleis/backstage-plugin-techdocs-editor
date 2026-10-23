import { Page, expect, test } from '@playwright/test';
import { FakeGitHub } from './fake-github';
import { editor, notice, openEditor, panelButton, setTabVisible, status, typeAfter, waitForPending } from './helpers';

/**
 * Rascunho x versão publicada: outra pessoa publica na main depois que o rascunho começou. Sem
 * conflito, o editor traz o que foi publicado sozinho; com conflito (mesmo trecho), mostra o aviso e
 * a tela para escolher o que fica, e grava a resolução como merge, sem a pessoa ver Git.
 */

const FILE = 'docs/guias/primeiros-passos.md';
const BRANCH = 'docs/pessoa-teste/docs-guias-primeiros-passos';
const ANCHOR = 'Experimente editá-la!';
const MINE = ' Versão minha.';
const THEIRS = ' Versão publicada.';

/** A página na main com uma alteração no mesmo parágrafo que a pessoa edita (conflito). */
const sameLine = (github: FakeGitHub) => github.file(FILE)!.replace(ANCHOR, `${ANCHOR}${THEIRS}`);
/** A página na main com uma alteração em outro parágrafo (sem conflito). */
const otherParagraph = (github: FakeGitHub) =>
  github.file(FILE)!.replace('Você vai precisar de:', 'Você vai precisar de (publicado):');

const conflictAlert = (page: Page) => page.getByTestId('conflict-alert');
const resolver = (page: Page) => page.getByTestId('conflict-resolver');

async function edit(page: Page, typed = MINE) {
  await typeAfter(page, ANCHOR, typed);
  await waitForPending(page);
}

async function reopen(page: Page) {
  await page.reload();
  await expect(editor(page)).toBeVisible({ timeout: 30_000 });
}

/** Rascunho com PR em draft e verificações rodadas. */
async function verifiedDraft(page: Page, github: FakeGitHub) {
  await openEditor(page, github);
  await edit(page);
  await panelButton(page, 'Salvar e verificar').click();
  await expect(status(page)).toHaveText('Rascunho');
  return github.openPull()!;
}

test.describe('publicação de outra pessoa sem conflito', () => {
  test('outro arquivo publicado: o rascunho é atualizado sozinho e as verificações rodam de novo', async ({ page }) => {
    const github = new FakeGitHub();
    const pr = await verifiedDraft(page, github);
    github.publishOnMain('docs/index.md', '# Wiki\n\nPágina inicial nova.\n');
    const runs = github.pipelineRuns.length;

    await reopen(page);
    await expect(status(page)).toHaveText('Rascunho');
    await expect(conflictAlert(page)).toHaveCount(0);
    // O merge foi feito pelo GitHub (POST /merges) e o rascunho tem as duas coisas
    expect(github.calls).toContain('POST /repos/edtroleis/docs-editor-wiki-demo/merges');
    expect(github.file('docs/index.md', BRANCH)).toBe('# Wiki\n\nPágina inicial nova.\n');
    expect(github.file(FILE, BRANCH)).toContain(`${ANCHOR}${MINE}`);
    expect(github.hasConflict(pr)).toBe(false);
    expect(github.pipelineRuns.length).toBe(runs + 1);
    // A página em si não mudou: sem aviso
    await expect(notice(page)).toHaveCount(0);
  });

  test('mesma página, outro parágrafo: o editor mostra as duas alterações e avisa', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    await panelButton(page, 'Salvar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho salvo');
    github.publishOnMain(FILE, otherParagraph(github));

    await reopen(page);
    await expect(notice(page)).toContainText('recebeu as alterações que outras pessoas publicaram');
    await expect(editor(page)).toContainText(`${ANCHOR}${MINE}`);
    await expect(editor(page)).toContainText('Você vai precisar de (publicado):');
    // Continua "não verificado": o merge manteve o [skip ci] do rascunho
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    expect(github.pipelineRuns).toEqual([]);
  });

  test('publicado enquanto o editor está aberto: ao salvar, o rascunho já vem atualizado', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    github.publishOnMain(FILE, otherParagraph(github));
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    await expect(notice(page)).toContainText('recebeu as alterações');
    await expect(editor(page)).toContainText('Você vai precisar de (publicado):');
    const content = github.file(FILE, BRANCH)!;
    expect(content).toContain(`${ANCHOR}${MINE}`);
    expect(content).toContain('Você vai precisar de (publicado):');
    // As verificações que aparecem são as do commit de merge (a ponta do rascunho)
    expect(github.pipelineRuns.at(-1)).toBe(github.refs.get(BRANCH));
  });
});

test.describe('conflito com a versão publicada', () => {
  test('ao abrir: aviso, botões travados e o GitHub sem verificações nem merge', async ({ page }) => {
    const github = new FakeGitHub();
    const pr = await verifiedDraft(page, github);
    github.publishOnMain(FILE, sameLine(github));

    await reopen(page);
    await expect(conflictAlert(page)).toContainText('as duas mudaram o mesmo trecho');
    await expect(status(page)).toHaveText('Conflito com a versão publicada');
    await expect(panelButton(page, 'Salvar e verificar')).toBeDisabled();
    await expect(panelButton(page, 'Enviar para publicação')).toBeDisabled();
    await expect(panelButton(page, 'Enviar para publicação')).toHaveAccessibleName(/resolva o conflito antes de enviar/);
    // Como no GitHub: PR com conflito não roda a pipeline e não deixa fazer o merge
    expect(github.hasConflict(pr)).toBe(true);
    expect(() => github.mergeOnGitHub(pr)).toThrow(/conflito/);
  });

  test('resolver mantendo as duas: grava um merge, o PR volta a ser verificado e pode ser publicado', async ({ page }) => {
    const github = new FakeGitHub();
    const pr = await verifiedDraft(page, github);
    // Outra coisa do rascunho (ex.: imagem enviada) e outra coisa publicada não podem se perder
    github.commitOutside(BRANCH, 'docs/assets/foto.png', 'iVBORw0KGgo=');
    github.publishOnMain('docs/index.md', '# Wiki\n\nPágina inicial nova.\n');
    github.publishOnMain(FILE, sameLine(github));

    await reopen(page);
    await conflictAlert(page).getByRole('button', { name: 'Resolver conflito' }).click();
    await expect(resolver(page)).toContainText('Em 1 trecho as duas mudaram o mesmo ponto');
    const conflict = resolver(page).getByTestId('conflict');
    await expect(conflict).toHaveCount(1);
    await expect(conflict).toContainText(`Versão publicada${'Esta página é um exemplo de guia.'}`);
    await expect(conflict).toContainText(`${ANCHOR}${THEIRS}`);
    await expect(conflict).toContainText(`${ANCHOR}${MINE}`);
    const done = resolver(page).getByRole('button', { name: 'Concluir' });
    await expect(done).toBeDisabled();
    await expect(resolver(page)).toContainText('Falta escolher 1 trecho');

    await conflict.getByRole('button', { name: 'Manter as duas' }).click();
    await done.click();
    await expect(resolver(page)).toHaveCount(0);
    await expect(notice(page)).toContainText('Conflito resolvido');
    await expect(conflictAlert(page)).toHaveCount(0);
    await expect(editor(page)).toContainText(`${ANCHOR}${THEIRS}`);
    await expect(editor(page)).toContainText(`${ANCHOR}${MINE}`);

    // No GitHub: commit de merge com os dois pais, sem conflito e com tudo junto
    const head = github.commits.get(github.refs.get(BRANCH)!)!;
    expect(head.parents).toHaveLength(2);
    expect(head.parents[1]).toBe(github.refs.get('main'));
    const content = github.file(FILE, BRANCH)!;
    expect(content).toContain(`${ANCHOR}${THEIRS}\n${'Esta página é um exemplo de guia.'}`);
    expect(content).toContain(`${ANCHOR}${MINE}`);
    expect(github.file('docs/assets/foto.png', BRANCH)).toBe('iVBORw0KGgo=');
    expect(github.file('docs/index.md', BRANCH)).toBe('# Wiki\n\nPágina inicial nova.\n');
    expect(github.hasConflict(pr)).toBe(false);
    expect(github.pipelineRuns.at(-1)).toBe(head.sha);

    await expect(status(page)).toHaveText('Rascunho');
    await panelButton(page, 'Enviar para publicação').click();
    await expect(status(page)).toHaveText('Aguardando publicação');
    github.mergeOnGitHub(pr);
    expect(github.file(FILE)).toContain(`${ANCHOR}${MINE}`);
    expect(github.file('docs/index.md')).toBe('# Wiki\n\nPágina inicial nova.\n');
  });

  test('ao salvar e verificar: salva, não cria PR e pede a resolução; depois verifica normalmente', async ({ page }) => {
    const github = new FakeGitHub();
    await openEditor(page, github);
    await edit(page);
    github.publishOnMain(FILE, sameLine(github));
    await panelButton(page, 'Salvar e verificar').click();
    await expect(notice(page)).toContainText('resolva o conflito para continuar');
    await expect(status(page)).toHaveText('Conflito com a versão publicada');
    expect(github.file(FILE, BRANCH)).toContain(`${ANCHOR}${MINE}`);
    expect(github.openPull()).toBeUndefined();

    await conflictAlert(page).getByRole('button', { name: 'Resolver conflito' }).click();
    await resolver(page).getByRole('button', { name: 'Ficar com a minha' }).click();
    await resolver(page).getByRole('button', { name: 'Concluir' }).click();
    await expect(notice(page)).toContainText('Conflito resolvido');
    await expect(editor(page)).toContainText(`${ANCHOR}${MINE}`);
    await expect(editor(page)).not.toContainText(THEIRS.trim());
    // Sem PR ainda: falta verificar
    await expect(status(page)).toHaveText('Rascunho salvo, não verificado');
    await panelButton(page, 'Salvar e verificar').click();
    await expect(status(page)).toHaveText('Rascunho');
    expect(github.openPull()).toBeDefined();
    expect(github.hasConflict(github.openPull()!)).toBe(false);
    expect(github.pipelineRuns).toHaveLength(1);
  });

  test('ficar com a publicada: o texto da pessoa naquele trecho sai', async ({ page }) => {
    const github = new FakeGitHub();
    await verifiedDraft(page, github);
    github.publishOnMain(FILE, sameLine(github));
    await reopen(page);
    await conflictAlert(page).getByRole('button', { name: 'Resolver conflito' }).click();
    await resolver(page).getByRole('button', { name: 'Ficar com a publicada' }).click();
    await resolver(page).getByRole('button', { name: 'Concluir' }).click();
    await expect(notice(page)).toContainText('Conflito resolvido');
    expect(github.file(FILE, BRANCH)).toBe(github.file(FILE));
  });

  test('cancelar volta ao editor com o aviso; com texto não salvo, resolver fica travado', async ({ page }) => {
    const github = new FakeGitHub();
    await verifiedDraft(page, github);
    github.publishOnMain(FILE, sameLine(github));
    await reopen(page);
    const resolve = conflictAlert(page).getByRole('button', { name: 'Resolver conflito' });
    await resolve.click();
    await resolver(page).getByRole('button', { name: 'Cancelar' }).click();
    await expect(resolver(page)).toHaveCount(0);
    await expect(editor(page)).toContainText(`${ANCHOR}${MINE}`);
    await expect(conflictAlert(page)).toBeVisible();

    await typeAfter(page, 'Você vai precisar de:', ' Mais.');
    // A etiqueta continua "Conflito…": a edição aparece no botão de salvar rascunho
    await expect(panelButton(page, 'Salvar rascunho')).toBeEnabled();
    await expect(resolve).toBeDisabled();
    await expect(conflictAlert(page)).toContainText('Salve o rascunho para resolver');
    await panelButton(page, 'Salvar rascunho').click();
    await expect(resolve).toBeEnabled();
    // A resolução parte do texto recém-salvo
    await resolve.click();
    await resolver(page).getByRole('button', { name: 'Ficar com a minha' }).click();
    await resolver(page).getByRole('button', { name: 'Concluir' }).click();
    await expect(notice(page)).toContainText('Conflito resolvido');
    expect(github.file(FILE, BRANCH)).toContain('Você vai precisar de: Mais.');
    expect(github.file(FILE, BRANCH)).toContain(`${ANCHOR}${MINE}`);
  });

  test('publicado enquanto a pessoa estava em outra aba: o aviso aparece ao voltar', async ({ page }) => {
    const github = new FakeGitHub();
    await verifiedDraft(page, github);
    await setTabVisible(page, false);
    github.publishOnMain(FILE, sameLine(github));
    await setTabVisible(page, true);
    await expect(conflictAlert(page)).toBeVisible({ timeout: 5_000 });
    await expect(status(page)).toHaveText('Conflito com a versão publicada');
  });

  test('descartar o rascunho com conflito: volta à versão publicada, sem aviso', async ({ page }) => {
    const github = new FakeGitHub();
    await verifiedDraft(page, github);
    github.publishOnMain(FILE, sameLine(github));
    await reopen(page);
    await expect(conflictAlert(page)).toBeVisible();
    page.once('dialog', dialog => dialog.accept());
    await panelButton(page, 'Descartar rascunho').click();
    await expect(notice(page)).toContainText('Rascunho descartado');
    await expect(conflictAlert(page)).toHaveCount(0);
    await expect(editor(page)).toContainText(`${ANCHOR}${THEIRS}`);
    await expect(status(page)).toHaveText('Sem alterações');
  });
});
