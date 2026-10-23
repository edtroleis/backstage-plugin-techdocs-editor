import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link } from '@backstage/core-components';
import {
  commitResolution,
  dirOf,
  FileVersion,
  fixLintProblems,
  fromEditor,
  LintFinding,
  lintFindings,
  MainConflict,
  MainSync,
  PullRequest,
  relativePath,
  resolvePath,
  SKIP_CI,
  syncWithMain,
  toEditor,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useChecks } from './useChecks';
import { usePolling } from './usePolling';
import { useEditorConfig } from './config';
import { useEditorTranslation } from './useEditorTranslation';
import { fileToBase64, syncTarget, titleOf } from './editorUtils';
import { formatVersionDate } from './HistoryDialog';
import type { LoadedEditor } from './useEditorSession';
import type { EditorDocument } from './useEditorDocument';

/** Espera da digitação parar antes de rodar o lint. */
const LINT_DELAY_MS = 400;

/** Junta frases de aviso (as vazias saem). */
const sentences = (...parts: string[]) => parts.filter(Boolean).join(' ');

type Options = {
  loaded: LoadedEditor;
  doc: EditorDocument;
  /** Endereço da página no TechDocs (vai na descrição do PR). */
  docsUrl: string;
  /** Fecha o histórico depois de restaurar uma versão. */
  closeHistory: () => void;
};

/**
 * O caminho do texto até a publicação: salvar rascunho, salvar e verificar (lint, commit, PR em draft e
 * pipeline), enviar, descartar, restaurar uma versão e trazer o que foi publicado enquanto isso (com a
 * resolução de conflito). Também o lint ao vivo e as imagens do editor.
 */
export function usePublishFlow({ loaded, doc, docsUrl, closeHistory }: Options) {
  const { client, session, editedBy } = loaded;
  const config = useEditorConfig();
  const { t, ruleText, errorText } = useEditorTranslation();
  const { pending, latestMarkdown, savedSource, editorKey } = doc;
  // "Salvar rascunho" não roda a pipeline (configurável: sem pipeline, o marcador não serve para nada)
  const draftMarker = config.skipCi ? ` ${SKIP_CI}` : '';

  // Versão (SHA) do arquivo em que o texto do editor se baseia. Gravar com ela faz o GitHub recusar
  // (409) se o arquivo mudou por fora, em vez de sobrescrever a versão mais nova
  const baseSha = useRef<string | undefined>(session.contentSha);
  // Commit da main em que o texto se baseia enquanto não há rascunho: o rascunho nasce dele
  const branchFrom = useRef(session.mainSha);
  // Commit gravado pelo último "Salvar e verificar": logo depois do commit o GitHub ainda devolve o PR
  // apontando para o commit anterior, e o painel mostraria as verificações antigas
  const expectedHead = useRef<string>();
  const [pr, setPr] = useState<PullRequest | null>(session.pr);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string>();
  const [notice, setNotice] = useState<ReactNode>(
    loaded.pageUpdated ? t('notices.draftReceivedPublished') : undefined,
  );
  // Problemas de formatação do texto como vai ser salvo (o mesmo lint do check "Formatação do texto")
  const [lintProblems, setLintProblems] = useState<LintFinding[]>([]);
  // O que o último salvamento ajustou sozinho, para avisar a pessoa
  const adjusted = useRef<string[]>([]);
  // A branch do rascunho existe no GitHub
  const [hasBranch, setHasBranch] = useState(session.hasBranch);
  // O rascunho foi salvo depois da última verificação ("Salvar rascunho" não dispara a pipeline)
  const [unverified, setUnverified] = useState(loaded.unverified);
  // O rascunho e a versão publicada mudaram o mesmo trecho da página (o GitHub não consegue juntar)
  const [conflict, setConflict] = useState<MainConflict | undefined>(loaded.conflict);
  // A tela de resolução do conflito está aberta no lugar do editor
  const [resolving, setResolving] = useState(false);
  // Verificações da pipeline do PR do rascunho (consulta periódica)
  const { checks, annotations, pollError, stalled, clearChecks } = useChecks({
    client,
    pr,
    setPr,
    expectedHead,
    pollMs: config.pollMs,
    idlePollMs: config.idlePollMs,
    startTimeoutMs: config.startTimeoutMs,
    errorText,
  });

  // Lint enquanto a pessoa escreve: o problema aparece antes de salvar, sem esperar a pipeline
  useEffect(() => {
    const timer = setTimeout(
      () => setLintProblems(lintFindings(fromEditor(pending ?? latestMarkdown.current), session.lintConfig)),
      LINT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [pending, session, editorKey, latestMarkdown]);

  // ------------------------------------------------------------ versão publicada

  /**
   * Resultado da sincronização com a main no editor: com conflito, mostra o aviso; atualizado, o texto
   * passa a ser o do rascunho já com o que foi publicado. Devolve uma frase para o aviso (ou vazia).
   */
  const applySync = (synced: MainSync): string => {
    if (synced.kind === 'conflict') {
      setConflict(synced.conflict);
      return t('notices.syncConflict');
    }
    setConflict(undefined);
    if (synced.kind === 'up-to-date') return '';
    // O merge é o novo commit do rascunho: as verificações que valem são as dele
    expectedHead.current = synced.commitSha;
    setPr(p => (p?.state === 'open' ? { ...p, headSha: synced.commitSha } : p));
    clearChecks();
    setHasBranch(true);
    baseSha.current = synced.file.sha;
    if (!synced.pageChanged) return '';
    doc.showSaved(synced.file.content);
    return t('notices.syncUpdated');
  };

  const syncNow = async () => {
    const synced = await syncWithMain(client, syncTarget(session));
    return { conflicted: synced.kind === 'conflict', note: applySync(synced) };
  };

  // Com o editor aberto, outra pessoa pode publicar: confere de tempos em tempos (sem texto não salvo).
  // Publicar é raro: intervalo de tudo parado, e na hora ao voltar para a aba
  usePolling({
    enabled: hasBranch && !conflict && !resolving,
    run: async () => {
      if (pending !== undefined || busy) return;
      const synced = await syncWithMain(client, syncTarget(session));
      const note = applySync(synced);
      if (synced.kind === 'updated' && note) setNotice(note);
    },
    delayMs: () => config.idlePollMs,
    resetKey: session,
  });

  // ------------------------------------------------------------ apoio

  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setActionError(undefined);
    setNotice(undefined);
    // Ao salvar, o resultado das verificações anteriores some na hora: vale só para a versão antiga
    clearChecks();
    try {
      await action();
    } catch (e) {
      setActionError(errorText(e));
    } finally {
      setBusy(false);
    }
  };

  /** Cria a branch do rascunho a partir da main, se ainda não existir. */
  const ensureBranch = useCallback(async () => {
    if (!(await client.getBranchSha(session.branch))) {
      await client.createBranch(session.branch, branchFrom.current);
    }
  }, [client, session]);

  /** Texto do editor no formato do repositório, recusando imagem que não foi enviada. */
  const currentContent = (markdown: string) => {
    const content = fromEditor(markdown);
    if (/\]\(blob:/.test(content)) {
      throw new Error(t('errors.blobImage'));
    }
    return content;
  };

  /** Depois de um commit do texto: o que foi salvo vira a referência e o rascunho local sai. */
  const afterCommit = (content: string) => {
    doc.markSaved(content);
    setHasBranch(true);
  };

  /** Mensagem de commit (título da página) com quem editou no portal. */
  const commitMessage = (
    key: 'git.draftCommit' | 'git.updateCommit' | 'git.resolveCommit',
    content: string,
    suffix = '',
  ) => `${t(key, { title: titleOf(content, session.filePath) })}${suffix}\n\n${t('git.editedBy', { user: editedBy })}`;

  // ------------------------------------------------------------ imagens

  /**
   * Imagem colada/enviada no editor: commit em `<docs>/assets/` na branch do rascunho.
   * Devolve o caminho relativo à página, que é o que o MkDocs espera no Markdown.
   */
  const uploadImage = useCallback(
    async (file: File) => {
      // O editor descarta erros do envio em silêncio: mostra na tela antes de repassar
      try {
        if (!file.type.startsWith('image/')) throw new Error(t('errors.notAnImage', { name: file.name }));
        // A imagem vai para o repositório: arquivos enormes pesam em todo clone e na publicação
        if (file.size > config.maxImageBytes) {
          throw new Error(t('errors.imageTooLarge', { name: file.name, max: String(config.maxImageBytes / 1024 / 1024) }));
        }
        await ensureBranch();
        const fileName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-');
        const path = `${session.docsDir}/assets/${Date.now()}-${fileName}`;
        await client.putBinary(
          path,
          session.branch,
          await fileToBase64(file),
          // [skip ci]: a imagem chega antes do texto que a usa; a verificação é a do "Salvar e verificar"
          `${t('git.imageCommit', { file: fileName })}${draftMarker}\n\n${t('git.editedBy', { user: editedBy })}`,
        );
        setHasBranch(true);
        setUnverified(true);
        return relativePath(dirOf(session.filePath), path);
      } catch (e) {
        setActionError(t('errors.imageUpload', { error: errorText(e) }));
        throw e;
      }
    },
    [client, session, ensureBranch, editedBy, draftMarker, t, errorText, config.maxImageBytes],
  );

  /** Mostra no editor imagens com caminho relativo, lendo do rascunho (ou da main). */
  const resolveImage = useCallback(
    async (url: string) => {
      // Vazio = bloco de imagem novo, ainda sem imagem: tem que continuar vazio para o editor mostrar
      // o botão de envio (antes virava o caminho da pasta e o bloco ficava cinza, sem botão)
      if (!url.trim() || /^([a-z]+:|\/)/i.test(url)) return url;
      const path = resolvePath(dirOf(session.filePath), url);
      const blob =
        (await client.getRaw(path, session.branch)) ??
        (await client.getRaw(path, session.repo.defaultBranch));
      return blob ? URL.createObjectURL(blob) : url;
    },
    [client, session],
  );

  // ------------------------------------------------------------ salvar

  /**
   * "Salvar rascunho": só guarda o texto na branch do rascunho, como está. Sem lint, sem PR e sem
   * pipeline (o commit leva [skip ci]).
   */
  const saveDraftOnly = async () => {
    if (pending === undefined) throw new Error(t('errors.nothingToSave'));
    const content = currentContent(pending);
    await ensureBranch();
    const onBranch = await client.getFile(session.filePath, session.branch);
    if (onBranch?.content !== content) {
      // No modo proxy o autor do commit é a conta do servidor: registra quem editou no portal
      ({ sha: baseSha.current } = await client.putFile(
        session.filePath,
        session.branch,
        content,
        baseSha.current ?? onBranch?.sha,
        commitMessage('git.draftCommit', content, draftMarker),
      ));
      setUnverified(true);
    }
    afterCommit(content);
    return (await syncNow()).note;
  };

  /**
   * "Salvar e verificar": lint (com as correções automáticas), commit na branch do rascunho e PR em
   * draft (criado na primeira vez), o que dispara as verificações automáticas.
   */
  const saveAndVerify = async (): Promise<{ conflicted: boolean; note: string }> => {
    const { repo, branch, filePath } = session;
    const edited = currentContent(pending ?? latestMarkdown.current);
    // Mesmo lint da pipeline. O que tem correção automática é ajustado aqui (ex.: Título 1 a mais,
    // título que pula nível, pontuação no fim do título); só trava o que precisa de decisão da pessoa
    const content = fixLintProblems(edited, session.lintConfig);
    const remaining = lintFindings(content, session.lintConfig);
    setLintProblems(remaining);
    if (remaining.length) {
      throw new Error(t('errors.lintBlocking', { count: remaining.length }));
    }
    adjusted.current =
      content === edited ? [] : [...new Set(lintFindings(edited, session.lintConfig).map(p => ruleText(p.rule, p.message)))];

    await ensureBranch();
    const onBranch = await client.getFile(filePath, branch);
    const message = commitMessage('git.updateCommit', content);
    if (onBranch?.content !== content) {
      const saved = await client.putFile(filePath, branch, content, baseSha.current ?? onBranch?.sha, message);
      baseSha.current = saved.sha;
      expectedHead.current = saved.commitSha;
    } else if ((await client.getHeadMessage(branch)).includes(SKIP_CI)) {
      // Texto já guardado por "Salvar rascunho", que pulou a pipeline: um commit vazio a dispara
      expectedHead.current = await client.createEmptyCommit(branch, message);
    }
    afterCommit(content);
    setUnverified(false);
    // Com ajuste automático, o editor passa a mostrar o texto ajustado (o que foi salvo)
    if (adjusted.current.length) doc.show(content);
    // Traz o que foi publicado enquanto isso; com conflito, as verificações não rodariam (GitHub Actions
    // não roda em PR com conflito): o PR só é criado depois de resolver
    const synced = await syncNow();
    if (synced.conflicted) return synced;

    let current = pr?.state === 'open' ? pr : null;
    if (!current) {
      current = await client.createDraftPullRequest({
        branch,
        base: repo.defaultBranch,
        title: t('git.prTitle', { title: titleOf(content, filePath) }),
        body: [
          t('git.prBodyChange', { file: filePath }),
          '',
          t('git.prBodyEditedBy', { user: editedBy }),
          t('git.prBodyPage', { url: `${window.location.origin}${docsUrl}` }),
        ].join('\n'),
      });
    } else {
      current = await client.getPullRequest(current.number);
    }
    setPr(expectedHead.current ? { ...current, headSha: expectedHead.current } : current);
    clearChecks();
    return synced;
  };

  /** Frase sobre os ajustes automáticos do último salvamento (vazia se não houve). */
  const adjustedNotice = () =>
    adjusted.current.length ? t('notices.adjusted', { items: adjusted.current.join('; ') }) : '';

  // ------------------------------------------------------------ ações dos botões

  /** Correções automáticas do lint: reescreve o texto e recarrega o editor com ele. */
  const fixLint = () => {
    const fixed = fixLintProblems(fromEditor(pending ?? latestMarkdown.current), session.lintConfig);
    doc.onChange(toEditor(fixed));
    doc.show(fixed);
    setNotice(t('notices.lintFixed'));
  };

  const onSaveDraft = () =>
    run(async () => {
      const syncNote = await saveDraftOnly();
      setNotice(sentences(t('notices.draftSaved'), syncNote));
    });

  const onVerify = () =>
    run(async () => {
      const { conflicted, note } = await saveAndVerify();
      setNotice(
        conflicted
          ? sentences(t('notices.saved'), note)
          : sentences(t('notices.savedChecking'), adjustedNotice(), note),
      );
    });

  /** Grava o texto escolhido como merge do rascunho com a versão publicada e volta ao editor. */
  const onResolved = (content: string) =>
    run(async () => {
      const { commitSha, file } = await commitResolution(
        client,
        syncTarget(session),
        conflict!,
        content,
        commitMessage('git.resolveCommit', content),
      );
      expectedHead.current = commitSha;
      setPr(p => (p?.state === 'open' ? { ...p, headSha: commitSha } : p));
      // Sem PR, o rascunho ainda precisa de "Salvar e verificar"
      if (pr?.state !== 'open') setUnverified(true);
      baseSha.current = file.sha;
      afterCommit(file.content);
      doc.show(file.content);
      setConflict(undefined);
      setResolving(false);
      setNotice(pr?.state === 'open' ? t('notices.conflictResolvedChecking') : t('notices.conflictResolved'));
    });

  /**
   * "Enviar para publicação" / "Enviar para revisão": só para o que já passou por "Salvar e verificar"
   * (o botão fica desligado antes). Deixa o PR pronto para revisão e mostra o link. O merge (que
   * publica) é feito no GitHub por quem revisa; o editor não faz merge.
   */
  const onSend = () =>
    run(async () => {
      if (!pr?.draft || pending !== undefined || unverified) throw new Error(t('errors.checkBeforeSend'));
      await client.markReadyForReview(pr.nodeId);
      const latest = await client.getPullRequest(pr.number);
      setPr(expectedHead.current ? { ...latest, headSha: expectedHead.current } : latest);
      const link = (
        <Link to={latest.htmlUrl} target="_blank">
          #{latest.number}
        </Link>
      );
      setNotice(t(session.requiredApprovals > 0 ? 'notices.prOpenedForReview' : 'notices.prOpened', { link }));
    });

  const onDiscard = () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('confirm.discard'))) return;
    run(async () => {
      if (pr?.state === 'open') await client.closePullRequest(pr.number);
      if (await client.getBranchSha(session.branch)) await client.deleteBranch(session.branch);
      setHasBranch(false);
      setUnverified(false);
      doc.dropPending();
      branchFrom.current = (await client.getBranchSha(session.repo.defaultBranch))!;
      const original = (await client.getFile(session.filePath, branchFrom.current))!;
      setPr(null);
      clearChecks();
      doc.setMode('visual');
      doc.showSaved(original.content);
      baseSha.current = original.sha;
      expectedHead.current = undefined;
      setConflict(undefined);
      setResolving(false);
      setNotice(t('notices.draftDiscarded'));
    });
  };

  /**
   * "Restaurar" no histórico: coloca o texto da versão escolhida no editor, como alteração não salva.
   * Publicar é o fluxo normal (salvar, verificar, enviar); restaurar a mais recente volta à publicada.
   */
  const onRestore = async (version: FileVersion) => {
    // eslint-disable-next-line no-alert
    if (pending !== undefined && !window.confirm(t('confirm.restore'))) return;
    setActionError(undefined);
    setNotice(undefined);
    setBusy(true);
    try {
      const file = await client.getFile(session.filePath, version.sha);
      if (!file) throw new Error(t('errors.versionWithoutFile'));
      const when = formatVersionDate(version.date);
      closeHistory();
      doc.setMode('visual');
      doc.show(file.content);
      if (file.content === savedSource.current) {
        // Igual ao que já está salvo: nada a guardar
        doc.dropPending();
        setNotice(t('notices.alreadyVersion', { when }));
      } else {
        doc.onChange(toEditor(file.content));
        setNotice(t('notices.versionRestored', { when }));
      }
    } catch (e) {
      setActionError(t('errors.restoreFailed', { error: errorText(e) }));
    } finally {
      setBusy(false);
    }
  };

  return {
    pr,
    busy,
    notice,
    setNotice,
    actionError,
    setActionError,
    hasBranch,
    unverified,
    conflict,
    resolving,
    setResolving,
    lintProblems,
    checks,
    annotations,
    pollError,
    stalled,
    uploadImage,
    resolveImage,
    fixLint,
    onSaveDraft,
    onVerify,
    onResolved,
    onSend,
    onDiscard,
    onRestore,
  };
}
