import { Entity } from '@backstage/catalog-model';
import { GitHubClient, PullRequest, Repo } from './github';
import type { Configuration } from 'markdownlint';
import { docsDirFromMkdocs, pageFileCandidates, toEditor } from './mkdocs';
import { DEFAULT_LINT_CONFIG, LINT_CONFIG_FILES, parseLintConfig } from './lint';
import { loadRepoConfig, type RepoConfig } from './repoConfig';

const SLUG_ANNOTATION = 'github.com/project-slug';

/** A página do TechDocs não tem arquivo correspondente no repositório. */
export class PageNotFoundError extends Error {
  constructor(readonly page: string, readonly docsDir: string) {
    super(`Page "${page || '/'}" not found in ${docsDir}/`);
    this.name = 'PageNotFoundError';
  }
}

/** A branch do rascunho existe, mas sem o arquivo da página. */
export class DraftFileMissingError extends Error {
  constructor(readonly filePath: string, readonly branch: string) {
    super(`File ${filePath} does not exist in draft ${branch}`);
    this.name = 'DraftFileMissingError';
  }
}
const SOURCE_ANNOTATION = 'backstage.io/source-location';
const TECHDOCS_ANNOTATION = 'backstage.io/techdocs-ref';

/** Tudo o que o editor precisa saber sobre a página sendo editada. */
export type EditSession = {
  repo: Repo;
  login: string;
  filePath: string;
  /** Pasta das docs no repositório (ex.: "docs"); imagens vão para `<docsDir>/assets/`. */
  docsDir: string;
  /** Branch do rascunho: uma por pessoa e por arquivo, para retomar de onde parou. */
  branch: string;
  hasBranch: boolean;
  /** Conteúdo atual (do rascunho, se existir; senão da main), já no formato do editor. */
  content: string;
  /** O mesmo conteúdo, exatamente como está no arquivo (as linhas batem com as da pipeline). */
  rawContent: string;
  contentSha: string;
  /**
   * Commit da main de onde o texto foi lido quando ainda não há rascunho. O rascunho nasce dele (e
   * não da main do momento de salvar): se alguém publicar antes, o editor junta depois, sem sobrescrever.
   */
  mainSha: string;
  pr: PullRequest | null;
  requiredApprovals: number;
  /** Checks que a branch principal exige para o merge (vazio: nenhum obrigatório). */
  requiredChecks: string[];
  /** O repositório tem workflows do GitHub Actions (sem eles, nenhuma verificação roda nos PRs). */
  hasWorkflows: boolean;
  /** Configuração do markdownlint do repositório (a mesma que a pipeline usa). */
  lintConfig: Configuration;
  /** `.techdocs-editor.yaml` do repositório (a pipeline dele: modo, mensagens, tempo para começar). */
  repoConfig: RepoConfig;
};

/** Opções da sessão que vêm da configuração do plugin. */
export type SessionOptions = {
  /** Padrão do nome da branch do rascunho (ver branchFor). */
  branchPattern?: string;
};

const SOURCE_URL = /^(?:url:)?https?:\/\/([^/]+)\/([^/]+\/[^/]+?)(?:\.git)?(?:\/|$)/;

/** `dono/repositório` da documentação: `github.com/project-slug` ou, sem ele, o `source-location`. */
export function repoSlug(entity: Entity): string | undefined {
  const annotations = entity.metadata.annotations ?? {};
  if (annotations[SLUG_ANNOTATION]) return annotations[SLUG_ANNOTATION];
  return annotations[SOURCE_ANNOTATION]?.match(SOURCE_URL)?.[2];
}

/** Host do GitHub da documentação, pelo `source-location` (ex.: um GitHub Enterprise); sem ele, undefined. */
export function repoHost(entity: Entity): string | undefined {
  return entity.metadata.annotations?.[SOURCE_ANNOTATION]?.match(SOURCE_URL)?.[1];
}

/** Pasta do mkdocs.yml no repositório, a partir de `backstage.io/techdocs-ref: dir:<pasta>`. */
function techdocsBaseDir(entity: Entity): string {
  const ref = entity.metadata.annotations?.[TECHDOCS_ANNOTATION] ?? 'dir:.';
  const dir = ref.startsWith('dir:') ? ref.slice(4) : '.';
  return dir.replace(/^\.\/?/, '').replace(/\/+$/, '');
}

const join = (...parts: string[]) => parts.filter(Boolean).join('/');

/** Primeiro arquivo de configuração do markdownlint na raiz do repositório (como o markdownlint-cli2). */
async function loadLintConfig(client: GitHubClient, ref: string): Promise<Configuration> {
  for (const name of LINT_CONFIG_FILES) {
    const file = await client.getFile(name, ref);
    if (!file) continue;
    try {
      return parseLintConfig(name, file.content);
    } catch {
      // Configuração inválida: a pipeline também falharia; aqui segue com as regras padrão
      return DEFAULT_LINT_CONFIG;
    }
  }
  return DEFAULT_LINT_CONFIG;
}

/** Padrão do nome da branch do rascunho: uma por pessoa e por arquivo. */
export const DEFAULT_BRANCH_PATTERN = 'docs/{login}/{path}';

/**
 * Branch do rascunho de cada pessoa para cada arquivo. No padrão, `{login}` é o login do GitHub e
 * `{path}` o caminho do arquivo sem `.md`, com o que não é letra, número, `.`, `_` ou `-` virando `-`.
 */
export const branchFor = (login: string, filePath: string, pattern = DEFAULT_BRANCH_PATTERN) =>
  pattern
    .replace('{login}', login)
    .replace('{path}', filePath.replace(/\.md$/, '').replace(/[^A-Za-z0-9._-]+/g, '-'));

/** Arquivo da página do TechDocs no repositório (na ordem em que o MkDocs resolve) e a pasta das docs. */
export async function findPageFile(client: GitHubClient, entity: Entity, page: string, ref: string) {
  const base = techdocsBaseDir(entity);
  const mkdocs = await client.getFile(join(base, 'mkdocs.yml'), ref);
  const docsDir = join(base, docsDirFromMkdocs(mkdocs?.content));
  for (const candidate of pageFileCandidates(docsDir, page)) {
    if (await client.getFile(candidate, ref)) return { filePath: candidate, docsDir };
  }
  throw new PageNotFoundError(page, docsDir);
}

export async function loadSession(
  client: GitHubClient,
  entity: Entity,
  page: string,
  options: SessionOptions = {},
): Promise<EditSession> {
  const [repo, login] = await Promise.all([client.getRepo(), client.getLogin()]);
  const { filePath, docsDir } = await findPageFile(client, entity, page, repo.defaultBranch);

  const branch = branchFor(login, filePath, options.branchPattern);
  const [branchSha, mainSha, pr, rules, hasWorkflows, lintConfig, repoConfig] = await Promise.all([
    client.getBranchSha(branch),
    client.getBranchSha(repo.defaultBranch),
    client.findOpenPullRequest(branch),
    client.getBranchRules(repo.defaultBranch),
    // Sem permissão para listar workflows: supõe que há pipeline (o caso mais comum)
    client.hasWorkflows().catch(() => true),
    loadLintConfig(client, repo.defaultBranch),
    loadRepoConfig(client, repo.defaultBranch),
  ]);
  const file = await client.getFile(filePath, branchSha ? branch : mainSha!);
  if (!file) throw new DraftFileMissingError(filePath, branch);

  return {
    repo,
    login,
    filePath,
    docsDir,
    branch,
    hasBranch: Boolean(branchSha),
    content: toEditor(file.content),
    rawContent: file.content,
    contentSha: file.sha,
    mainSha: mainSha!,
    pr,
    requiredApprovals: rules.requiredApprovals,
    requiredChecks: rules.requiredChecks,
    hasWorkflows,
    lintConfig,
    repoConfig,
  };
}
