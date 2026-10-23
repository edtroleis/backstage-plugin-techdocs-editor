import { useMemo } from 'react';
import { Entity } from '@backstage/catalog-model';
import { configApiRef, useApi } from '@backstage/core-plugin-api';
import { DEFAULT_BRANCH_PATTERN, EditSession, type VerificationMode } from '@edtroleis/plugin-techdocs-editor-common';

/** Anotação que escolhe, por documentação, o que "Salvar e verificar" confere. */
const VERIFICATION_ANNOTATION = 'techdocs-editor/verification';

/** Configuração do plugin (`techdocsEditor` no app-config), com os padrões. */
export type EditorConfig = {
  auth: 'user' | 'proxy';
  githubHost: string;
  scopes: string[];
  branchPattern: string;
  skipCi: boolean;
  verification: VerificationMode;
  checkHelp: Record<string, string>;
  startTimeoutMs: number;
  pollMs: number;
  /** Intervalo com nada andando (checks terminados, versão publicada). */
  idlePollMs: number;
  /** Tamanho máximo de imagem enviada, em bytes. */
  maxImageBytes: number;
};

export function useEditorConfig(): EditorConfig {
  const config = useApi(configApiRef);
  return useMemo(() => {
    const c = config.getOptionalConfig('techdocsEditor');
    return {
      auth: c?.getOptionalString('github.auth') === 'proxy' ? 'proxy' : 'user',
      githubHost: c?.getOptionalString('github.host') ?? 'github.com',
      scopes: c?.getOptionalStringArray('github.scopes') ?? ['repo'],
      branchPattern: c?.getOptionalString('branchPattern') ?? DEFAULT_BRANCH_PATTERN,
      skipCi: c?.getOptionalBoolean('drafts.skipCi') ?? true,
      verification: (c?.getOptionalString('verification.mode') as VerificationMode | undefined) ?? 'auto',
      // Lido inteiro: os nomes dos jobs têm espaço e acento, que a leitura chave a chave recusa
      checkHelp: c?.getOptional<Record<string, string>>('verification.checkHelp') ?? {},
      startTimeoutMs: (c?.getOptionalNumber('verification.startTimeoutSeconds') ?? 120) * 1000,
      pollMs: (c?.getOptionalNumber('polling.intervalSeconds') ?? 8) * 1000,
      idlePollMs: (c?.getOptionalNumber('polling.idleIntervalSeconds') ?? 60) * 1000,
      maxImageBytes: (c?.getOptionalNumber('images.maxSizeMB') ?? 5) * 1024 * 1024,
    };
  }, [config]);
}

/**
 * O que "Salvar e verificar" confere nesta documentação. Vale, nesta ordem: a anotação do catálogo, o
 * `.techdocs-editor.yaml` do repositório e o app-config. No modo automático, se o repositório tem
 * pipeline (workflows do GitHub Actions ou checks obrigatórios, de qualquer CI). Sem pipeline, a
 * verificação é o lint do editor.
 */
export function verificationFor(entity: Entity, config: EditorConfig, session: EditSession): 'pipeline' | 'editor' {
  const annotation = entity.metadata.annotations?.[VERIFICATION_ANNOTATION];
  const mode =
    annotation === 'pipeline' || annotation === 'editor'
      ? annotation
      : session.repoConfig.verification.mode ?? config.verification;
  if (mode !== 'auto') return mode;
  return session.hasWorkflows || session.requiredChecks.length > 0 ? 'pipeline' : 'editor';
}

/** Mensagens dos checks que falharam: as do portal mais as do repositório (as do repositório valem). */
export const checkHelpFor = (config: EditorConfig, session: EditSession): Record<string, string> => ({
  ...config.checkHelp,
  ...session.repoConfig.verification.checkHelp,
});

/** Quanto esperar o primeiro check antes de avisar: o do repositório (CI com fila longa) ou o do portal. */
export const startTimeoutFor = (config: EditorConfig, session: EditSession): number =>
  (session.repoConfig.verification.startTimeoutSeconds ?? config.startTimeoutMs / 1000) * 1000;
