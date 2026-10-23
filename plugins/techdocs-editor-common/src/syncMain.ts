import { GitHubClient, GitHubError, RepoFile, TreeEntry } from './github';
import { MergeChunk, merge3 } from './merge3';

/** No commit, faz o GitHub Actions não rodar a pipeline ("Salvar rascunho" só guarda). */
export const SKIP_CI = '[skip ci]';

/** Conflito do rascunho com a versão publicada, com o que é preciso para gravar a resolução. */
export type MainConflict = {
  chunks: MergeChunk[];
  /** Ponta do rascunho e da main quando o conflito foi achado (os dois pais do commit de merge). */
  branchHead: string;
  mainHead: string;
  mergeBase: string;
};

export type MainSync =
  | { kind: 'up-to-date' }
  /** O rascunho recebeu o que foi publicado; `file` é a página como ficou no rascunho. */
  | { kind: 'updated'; commitSha: string; file: RepoFile; pageChanged: boolean }
  | { kind: 'conflict'; conflict: MainConflict };

type Target = { branch: string; base: string; filePath: string };

/** Mensagem de commit que mantém o "[skip ci]" de um rascunho ainda não verificado. */
async function keepSkipCi(client: GitHubClient, branch: string, message: string) {
  return (await client.getHeadMessage(branch)).includes(SKIP_CI) ? `${message} ${SKIP_CI}` : message;
}

/**
 * Traz para o rascunho o que foi publicado na main depois que ele começou. Sem conflito, o próprio
 * GitHub faz o merge (`POST /merges`) e ninguém precisa fazer nada; com conflito (409), devolve os
 * trechos para a pessoa escolher.
 */
export async function syncWithMain(client: GitHubClient, { branch, base, filePath }: Target): Promise<MainSync> {
  const cmp = await client.compare(base, branch);
  if (cmp.behindBy === 0) return { kind: 'up-to-date' };

  const before = await client.getFile(filePath, branch);
  try {
    const message = await keepSkipCi(client, branch, 'docs: atualiza o rascunho com a versão publicada');
    const commitSha = await client.mergeInto(branch, base, message);
    if (!commitSha) return { kind: 'up-to-date' };
    const file = (await client.getFile(filePath, branch))!;
    return { kind: 'updated', commitSha, file, pageChanged: file.sha !== before?.sha };
  } catch (e) {
    if (!(e instanceof GitHubError && e.status === 409)) throw e;
  }

  const [branchHead, mainHead] = await Promise.all([client.getBranchSha(branch), client.getBranchSha(base)]);
  const [original, mine, theirs] = await Promise.all([
    client.getFile(filePath, cmp.mergeBase),
    before,
    client.getFile(filePath, base),
  ]);
  return {
    kind: 'conflict',
    conflict: {
      chunks: merge3(original?.content ?? '', mine?.content ?? '', theirs?.content ?? ''),
      branchHead: branchHead!,
      mainHead: mainHead!,
      mergeBase: cmp.mergeBase,
    },
  };
}

/**
 * Grava a resolução: um commit de merge com dois pais (rascunho e main), como o "git merge" faria. A
 * árvore é a da main com as alterações do rascunho e, na página, o texto escolhido pela pessoa.
 * Devolve o SHA do commit e a página gravada.
 */
export async function commitResolution(
  client: GitHubClient,
  { branch, filePath }: Target,
  conflict: MainConflict,
  content: string,
  message: string,
): Promise<{ commitSha: string; file: RepoFile }> {
  if ((await client.getBranchSha(branch)) !== conflict.branchHead) {
    // O rascunho mudou depois que o conflito foi achado (outra aba): resolver de novo, com o novo texto
    throw new GitHubError('O rascunho mudou enquanto você resolvia o conflito.', 409);
  }
  const [mainTree, changes] = await Promise.all([
    client.getCommitTree(conflict.mainHead),
    client.compare(conflict.mergeBase, conflict.branchHead),
  ]);
  // Outros arquivos do rascunho (ex.: imagens enviadas) vão junto; a página leva o texto resolvido
  const entries: TreeEntry[] = changes.files
    .filter(f => f.path !== filePath)
    .flatMap(f => [
      ...(f.previousPath ? [{ path: f.previousPath, sha: null }] : []),
      { path: f.path, sha: f.removed ? null : f.sha },
    ]);
  entries.push({ path: filePath, content });
  const tree = await client.createTree(mainTree, entries);
  const commitSha = await client.createCommit(
    await keepSkipCi(client, branch, message),
    tree,
    [conflict.branchHead, conflict.mainHead],
  );
  await client.updateBranch(branch, commitSha);
  return { commitSha, file: (await client.getFile(filePath, branch))! };
}
