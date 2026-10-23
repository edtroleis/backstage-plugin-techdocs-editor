import { GitHubClient, PullRequest, SQUASH_MERGE_SETTINGS, TreeEntry } from './github';
import { LINT_CONFIG_FILES } from './lint';

/**
 * Setup de um repositório de documentação para o editor (spec 08, fase 7): verificações nos PRs,
 * regras do lint, merge por squash com a mensagem do PR e ruleset da branch principal. Usado pela
 * action do Scaffolder `techdocs-editor:setup` e pelo botão "Configurar verificações" do editor.
 * Só ajusta o que falta: num repositório com pipeline própria, o workflow não é trocado.
 */

/** Nomes dos jobs do workflow padrão: viram os checks obrigatórios do ruleset. */
export const SETUP_CHECK_NAMES = ['Formatação do texto', 'Links', 'Dados sensíveis', 'Montagem da documentação'];

export const SETUP_WORKFLOW_PATH = '.github/workflows/techdocs-checks.yml';

/** Workflows que já têm os checks padrão: o da demo e do template Nova Wiki, e o do setup. */
const STANDARD_WORKFLOWS = ['.github/workflows/techdocs.yml', SETUP_WORKFLOW_PATH];

export const SETUP_RULESET_NAME = 'techdocs-editor';

export const SETUP_BRANCH = 'techdocs-editor/setup';

/** Só verificações (nos PRs): a publicação continua com o Backstage (`builder: local`) ou com a pipeline de cada empresa. */
export const SETUP_WORKFLOW = `# Verificações das docs, criadas pelo setup do editor do TechDocs.
# Os nomes dos jobs aparecem no editor do portal e são os checks obrigatórios do ruleset.
name: techdocs-checks

on:
  pull_request:

permissions:
  contents: read

# Só a última verificação de cada rascunho importa
concurrency:
  group: techdocs-checks-\${{ github.head_ref }}
  cancel-in-progress: true

jobs:
  formatacao:
    name: ${SETUP_CHECK_NAMES[0]}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
      - uses: DavidAnson/markdownlint-cli2-action@05f32210e84442804257b2a6f20b273450ec8265 # v19.1.0
        with:
          globs: 'docs/**/*.md'

  links:
    name: ${SETUP_CHECK_NAMES[1]}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
      - uses: lycheeverse/lychee-action@e7477775783ea5526144ba13e8db5eec57747ce8 # v2.9.0
        with:
          args: --no-progress --root-dir \${{ github.workspace }}/docs 'docs/**/*.md'
          fail: true
          # Wiki nova, sem nenhum link ainda: não é erro (o padrão da action reprova)
          failIfEmpty: false

  dados-sensiveis:
    name: ${SETUP_CHECK_NAMES[2]}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@ff98106e4c7b2bc287b24eaf42907196329070c7 # v2.3.9
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}

  montagem:
    name: ${SETUP_CHECK_NAMES[3]}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4.4.0
        with:
          fetch-depth: 0
      - uses: actions/setup-python@a26af69be951a213d495a4c3e4e4022e16d87065 # v5.6.0
        with:
          python-version: '3.12'
      - run: pip install mkdocs-techdocs-core==1.7.1 mkdocs-git-revision-date-localized-plugin==1.6.0
      - run: mkdocs build --strict
`;

/** As mesmas regras do template Nova Wiki: ajustadas para quem está aprendendo Markdown. */
export const SETUP_MARKDOWNLINT = `# Regras ajustadas para quem está aprendendo Markdown
default: true
MD013: false   # tamanho de linha
MD033: false   # HTML inline
MD046: false   # estilo de bloco de código (admonitions usam indentação)
`;

/**
 * O que falta no repositório:
 * - `workflow`: nenhum workflow (sem verificações nos PRs);
 * - `markdownlint`: sem arquivo de regras do lint;
 * - `merge`: o merge não é só por squash com a mensagem do PR (o `[skip ci]` dos rascunhos chegaria à main);
 * - `ruleset`: a branch principal aceita mudança sem PR ou, com os checks padrão já na branch, não os exige.
 */
export type SetupStep = 'workflow' | 'markdownlint' | 'merge' | 'ruleset';

export type SetupPlan = {
  steps: SetupStep[];
  /** Admin pode tudo; quem só escreve pode abrir o PR com os arquivos. */
  isAdmin: boolean;
  defaultBranch: string;
  /** O repositório já roda os checks padrão (o ruleset pode exigi-los). */
  hasStandardChecks: boolean;
};

export type SetupOptions = {
  /** Aprovações exigidas pelo ruleset (0 = wiki do time; 1 = política oficial, spec 04). */
  requiredApprovals?: number;
};

export type SetupResult = {
  applied: SetupStep[];
  /** PR com os arquivos (`workflow`, `markdownlint`): o resto vale na hora. */
  pullRequest?: PullRequest;
};

/** Passos que mudam configuração do repositório: só admin. */
const ADMIN_STEPS: SetupStep[] = ['merge', 'ruleset'];

/** Os passos que esta pessoa consegue aplicar. */
export const applicableSteps = (plan: SetupPlan) =>
  plan.steps.filter(step => plan.isAdmin || !ADMIN_STEPS.includes(step));

const exists = async (client: GitHubClient, paths: string[], ref: string) =>
  (await Promise.all(paths.map(path => client.getFile(path, ref)))).some(Boolean);

export async function planSetup(client: GitHubClient): Promise<SetupPlan> {
  const repo = await client.getRepo();
  const ref = repo.defaultBranch;
  const [hasWorkflows, hasLintConfig, hasStandardChecks, rules] = await Promise.all([
    client.hasWorkflows().catch(() => true),
    exists(client, LINT_CONFIG_FILES, ref),
    exists(client, STANDARD_WORKFLOWS, ref),
    client.getBranchRules(ref),
  ]);
  const steps: SetupStep[] = [];
  // O GitHub leva alguns segundos para listar um workflow recém-enviado (ex.: logo depois do
  // publish:github do template): com o arquivo padrão lá, não abre um PR duplicando os checks
  if (!hasWorkflows && !hasStandardChecks) steps.push('workflow');
  if (!hasLintConfig) steps.push('markdownlint');
  if (repo.isAdmin && repo.squashWithPrMessage === false) steps.push('merge');
  if (repo.isAdmin && (!rules.requiresPullRequest || (hasStandardChecks && !rules.requiredChecks.length))) {
    steps.push('ruleset');
  }
  return { steps, isAdmin: repo.isAdmin, defaultBranch: ref, hasStandardChecks };
}

/**
 * Ruleset da branch principal: PR obrigatório e, se o repositório já roda os checks padrão, os 4
 * obrigatórios. Sem eles na branch principal ainda, exigir os checks travaria todos os PRs.
 */
export const setupRuleset = (requiredApprovals: number, withChecks: boolean) => ({
  name: SETUP_RULESET_NAME,
  target: 'branch',
  enforcement: 'active',
  conditions: { ref_name: { include: ['~DEFAULT_BRANCH'], exclude: [] } },
  rules: [
    { type: 'deletion' },
    { type: 'non_fast_forward' },
    {
      type: 'pull_request',
      parameters: {
        required_approving_review_count: requiredApprovals,
        dismiss_stale_reviews_on_push: true,
        require_code_owner_review: false,
        require_last_push_approval: false,
        required_review_thread_resolution: false,
        // Omitido, o GitHub liga esta proteção (preview), que pode pedir uma aprovação a mais em PRs
        // com commits sem conta do GitHub: as aprovações exigidas são só as de `requiredApprovals`
        require_extra_approval_for_unattributed_changes: false,
      },
    },
    ...(withChecks
      ? [
          {
            type: 'required_status_checks',
            parameters: {
              strict_required_status_checks_policy: false,
              required_status_checks: SETUP_CHECK_NAMES.map(context => ({ context })),
            },
          },
        ]
      : []),
  ],
});

/** Arquivos do PR de setup, conforme os passos. */
export function setupFiles(steps: SetupStep[]): TreeEntry[] {
  const files: TreeEntry[] = [];
  if (steps.includes('workflow')) files.push({ path: SETUP_WORKFLOW_PATH, content: SETUP_WORKFLOW });
  if (steps.includes('markdownlint')) files.push({ path: '.markdownlint.yaml', content: SETUP_MARKDOWNLINT });
  return files;
}

/**
 * Aplica o plano: merge e ruleset na hora (admin); workflow e regras do lint num PR, para o time
 * revisar. Rodar de novo não duplica nada: o PR aberto do setup e o ruleset `techdocs-editor` são
 * reaproveitados. Depois do merge do PR, rodar de novo passa a exigir os checks no ruleset.
 */
export async function applySetup(
  client: GitHubClient,
  plan: SetupPlan,
  options: SetupOptions & { prTitle: string; prBody: string; commitMessage: string },
): Promise<SetupResult> {
  const steps = applicableSteps(plan);
  const result: SetupResult = { applied: [] };

  if (steps.includes('merge')) {
    await client.updateRepo({ ...SQUASH_MERGE_SETTINGS });
    result.applied.push('merge');
  }
  if (steps.includes('ruleset')) {
    await client.saveRuleset(setupRuleset(options.requiredApprovals ?? 0, plan.hasStandardChecks));
    result.applied.push('ruleset');
  }

  const files = setupFiles(steps);
  if (files.length) {
    const open = await client.findOpenPullRequest(SETUP_BRANCH);
    if (open) {
      result.pullRequest = open;
    } else {
      const base = (await client.getBranchSha(plan.defaultBranch))!;
      const tree = await client.createTree(await client.getCommitTree(base), files);
      const commit = await client.createCommit(options.commitMessage, tree, [base]);
      // Branch de uma tentativa anterior sem PR: aponta para o commit novo
      if (await client.getBranchSha(SETUP_BRANCH)) await client.updateBranch(SETUP_BRANCH, commit, true);
      else await client.createBranch(SETUP_BRANCH, commit);
      result.pullRequest = await client.createPullRequest({
        branch: SETUP_BRANCH,
        base: plan.defaultBranch,
        title: options.prTitle,
        body: options.prBody,
        draft: false,
      });
    }
    result.applied.push(...steps.filter(step => step === 'workflow' || step === 'markdownlint'));
  }
  return result;
}
