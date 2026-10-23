import { useCallback, useEffect, useState } from 'react';
import {
  applicableSteps,
  applySetup,
  planSetup,
  repoHost,
  type SetupResult,
  type SetupStep,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useGitHubConnector } from './connect';
import type { LoadedEditor } from './useEditorSession';
import { useEditorTranslation } from './useEditorTranslation';

/**
 * "Configurar verificações" (spec 08, fase 7): para quem é admin do repositório, o que falta para o
 * editor conferir cada alteração (workflow, regras do lint, merge por squash, ruleset) e o botão que
 * aplica. Só consulta para admins, uma vez ao abrir.
 */
export function useRepoSetup({ client, session, entity }: LoadedEditor) {
  const { t } = useEditorTranslation();
  const { connect } = useGitHubConnector();
  const [steps, setSteps] = useState<SetupStep[]>([]);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SetupResult>();
  const [error, setError] = useState<string>();
  const isAdmin = session.repo.isAdmin;

  const plan = useCallback(async () => {
    const found = await planSetup(client);
    setSteps(applicableSteps(found));
    return found;
  }, [client]);

  useEffect(() => {
    // Sem admin, nada a oferecer; erro ao consultar só esconde o aviso
    if (isAdmin) plan().catch(() => setSteps([]));
  }, [isAdmin, plan]);

  const apply = async () => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(t('setup.confirm'))) return;
    setBusy(true);
    setError(undefined);
    try {
      const found = await plan();
      // Criar arquivo em .github/workflows/ exige o escopo `workflow` do OAuth: pedido só agora, para
      // quem vai configurar (no GitHub App, vale a permissão `workflows` da instalação)
      const writer = applicableSteps(found).includes('workflow')
        ? ((await connect(client.slug, { host: repoHost(entity), extraScopes: ['workflow'] })) ?? client)
        : client;
      const done = await applySetup(writer, found, {
        requiredApprovals: session.requiredApprovals,
        prTitle: t('setup.prTitle'),
        prBody: t('setup.prBody'),
        commitMessage: t('setup.commitMessage'),
      });
      setResult(done);
      // O que ficou no PR continua faltando até o merge: não oferece de novo
      setSteps([]);
    } catch (e) {
      setError(t('setup.error', { error: e instanceof Error ? e.message : String(e) }));
    } finally {
      setBusy(false);
    }
  };

  return { steps, busy, result, error, apply };
}

export type RepoSetup = ReturnType<typeof useRepoSetup>;
