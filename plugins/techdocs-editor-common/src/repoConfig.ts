import { parse as parseYaml } from 'yaml';
import type { GitHubClient } from './github';

/**
 * Configuração do editor no próprio repositório da documentação, na raiz da branch principal: cada
 * time descreve a sua pipeline sem mexer no app-config do portal. Vale sobre o app-config; a anotação
 * `techdocs-editor/verification` do catálogo vale sobre as duas.
 *
 * ```yaml
 * verification:
 *   mode: pipeline            # auto | pipeline | editor
 *   startTimeoutSeconds: 600  # fila do CI demora para começar
 *   checkHelp:                # mensagem em linguagem simples por nome de job (somada às do portal)
 *     build: A documentação não pôde ser montada.
 * ```
 */
export const REPO_CONFIG_FILE = '.techdocs-editor.yaml';

export type VerificationMode = 'auto' | 'pipeline' | 'editor';

export type RepoConfig = {
  verification: {
    mode?: VerificationMode;
    startTimeoutSeconds?: number;
    checkHelp: Record<string, string>;
  };
};

export const EMPTY_REPO_CONFIG: RepoConfig = { verification: { checkHelp: {} } };

const MODES: VerificationMode[] = ['auto', 'pipeline', 'editor'];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Lê o `.techdocs-editor.yaml`. Campo com valor inválido é ignorado (vale o do portal), para um erro
 * de digitação num repositório não travar o editor; YAML que não abre também.
 */
export function parseRepoConfig(text: string): RepoConfig {
  let data: unknown;
  try {
    data = parseYaml(text);
  } catch {
    return EMPTY_REPO_CONFIG;
  }
  const verification = isRecord(data) && isRecord(data.verification) ? data.verification : {};
  const { mode, startTimeoutSeconds, checkHelp } = verification;
  return {
    verification: {
      mode: MODES.includes(mode as VerificationMode) ? (mode as VerificationMode) : undefined,
      startTimeoutSeconds:
        typeof startTimeoutSeconds === 'number' && startTimeoutSeconds > 0 ? startTimeoutSeconds : undefined,
      checkHelp: isRecord(checkHelp)
        ? Object.fromEntries(
            Object.entries(checkHelp).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
          )
        : {},
    },
  };
}

/** A configuração do repositório na branch `ref`; sem o arquivo, a vazia. */
export async function loadRepoConfig(client: GitHubClient, ref: string): Promise<RepoConfig> {
  const file = await client.getFile(REPO_CONFIG_FILE, ref);
  return file ? parseRepoConfig(file.content) : EMPTY_REPO_CONFIG;
}
