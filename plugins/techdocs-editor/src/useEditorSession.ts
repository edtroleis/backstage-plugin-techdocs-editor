import { useEffect, useRef, useState } from 'react';
import { identityApiRef, useApi } from '@backstage/core-plugin-api';
import { Entity } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import {
  EditSession,
  GitHubClient,
  loadSession,
  MainConflict,
  OpenPullRequest,
  repoHost,
  repoSlug,
  SKIP_CI,
  syncWithMain,
  toEditor,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useGitHubConnector } from './connect';
import { useEditorConfig } from './config';
import { useEditorTranslation } from './useEditorTranslation';
import { localKey, readLocalDraft, syncTarget } from './editorUtils';

/** Tudo o que o editor precisa para abrir uma página, lido uma vez ao carregar. */
export type LoadedEditor = {
  /** Muda a cada carregamento: o editor é recriado do zero. */
  id: number;
  entity: Entity;
  client: GitHubClient;
  session: EditSession;
  /** Quem edita no portal (ref do usuário no Backstage), registrado nos commits e no PR. */
  editedBy: string;
  /** Texto inicial do editor: o rascunho guardado no navegador, se houver, ou o do GitHub. */
  markdown: string;
  /** O texto inicial veio do navegador (alteração não salva recuperada). */
  restored: boolean;
  /** Rascunho guardado sem verificação: sem PR ainda, ou o último commit pulou a pipeline. */
  unverified: boolean;
  /** O rascunho e a versão publicada mudaram o mesmo trecho da página. */
  conflict?: MainConflict;
  /** O rascunho recebeu o que foi publicado depois dele. */
  pageUpdated: boolean;
};

/**
 * Carrega a página para edição: entidade do catálogo, login do GitHub (popup só agora, quando a
 * pessoa quer editar), sessão (arquivo, branch, PR, regras) e o rascunho local. Um rascunho de antes
 * de outra publicação já recebe o que foi publicado.
 */
export function useEditorSession(entityRef: string, page: string) {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const { connect } = useGitHubConnector();
  const { branchPattern, skipCi } = useEditorConfig();
  const { t, errorText } = useEditorTranslation();
  const [loaded, setLoaded] = useState<LoadedEditor>();
  const [loadError, setLoadError] = useState<string>();
  // PRs abertos (de outras branches) que alteram esta página
  const [othersPrs, setOthersPrs] = useState<OpenPullRequest[]>([]);
  const loads = useRef(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const found = await catalogApi.getEntityByRef(entityRef);
      if (!found) throw new Error(t('errors.entityNotFound', { ref: entityRef }));
      const slug = repoSlug(found);
      if (!slug) throw new Error(t('errors.noRepository'));
      const gh = (await connect(slug, { host: repoHost(found) }))!;
      const [session0, identity] = await Promise.all([
        loadSession(gh, found, page, { branchPattern }),
        identityApi.getBackstageIdentity(),
      ]);
      let session = session0;
      const local = readLocalDraft(localKey(slug, session.filePath));
      const useLocal = local && local.contentSha === session.contentSha && local.markdown !== session.content;
      // Rascunho de antes de outra publicação: traz o que foi publicado (com texto não salvo, só ao salvar)
      let conflict: MainConflict | undefined;
      let pageUpdated = false;
      if (session.hasBranch && !useLocal) {
        const synced = await syncWithMain(gh, syncTarget(session)).catch(() => undefined);
        if (synced?.kind === 'updated') {
          const { file } = synced;
          session = { ...session, content: toEditor(file.content), rawContent: file.content, contentSha: file.sha };
          pageUpdated = synced.pageChanged;
        }
        if (synced?.kind === 'conflict') conflict = synced.conflict;
      }
      // Aviso, não bloqueio: se a consulta falhar, o editor abre do mesmo jeito
      const draftBranch = session.branch;
      gh.findOpenPullRequestsForFile(session.filePath)
        .then(prs => !cancelled && setOthersPrs(prs.filter(p => p.branch !== draftBranch)))
        .catch(() => undefined);
      const unverified =
        session.hasBranch &&
        (!session.pr || (skipCi && (await gh.getHeadMessage(session.branch)).includes(SKIP_CI)));
      if (cancelled) return;
      loads.current += 1;
      setLoaded({
        id: loads.current,
        entity: found,
        client: gh,
        session,
        editedBy: identity.userEntityRef,
        markdown: useLocal ? local.markdown : session.content,
        restored: Boolean(useLocal),
        unverified,
        conflict,
        pageUpdated,
      });
    })().catch(e => !cancelled && setLoadError(errorText(e)));
    return () => {
      cancelled = true;
    };
  }, [catalogApi, connect, identityApi, entityRef, page, branchPattern, skipCi, t, errorText]);

  return { loaded, loadError, othersPrs };
}
