import { GitHubClient, SQUASH_MERGE_SETTINGS } from './github';
import {
  applySetup,
  planSetup,
  SETUP_BRANCH,
  SETUP_CHECK_NAMES,
  SETUP_RULESET_NAME,
  SETUP_WORKFLOW,
  SETUP_WORKFLOW_PATH,
} from './setup';

type State = {
  isAdmin?: boolean;
  squash?: boolean;
  files?: string[];
  hasWorkflows?: boolean;
  requiresPullRequest?: boolean;
  requiredChecks?: string[];
  openSetupPr?: boolean;
  /** Conteúdo dos arquivos (os de `files` sem conteúdo aqui ficam vazios). */
  contents?: Record<string, string>;
};

/** Cliente do GitHub só com o que o setup usa, guardando as escritas. */
function fakeClient(state: State) {
  const writes: Array<[string, unknown]> = [];
  const client = {
    getRepo: async () => ({
      defaultBranch: 'main',
      canWrite: true,
      isAdmin: state.isAdmin ?? true,
      htmlUrl: '',
      squashWithPrMessage: (state.isAdmin ?? true) ? (state.squash ?? false) : undefined,
    }),
    hasWorkflows: async () => state.hasWorkflows ?? false,
    getFile: async (path: string) =>
      (state.files ?? []).includes(path) ? { content: state.contents?.[path] ?? '', sha: 'x' } : null,
    getBranchRules: async () => ({
      requiresPullRequest: state.requiresPullRequest ?? false,
      requiredApprovals: 0,
      requiredChecks: state.requiredChecks ?? [],
    }),
    updateRepo: async (settings: unknown) => void writes.push(['updateRepo', settings]),
    saveRuleset: async (ruleset: unknown) => void writes.push(['saveRuleset', ruleset]),
    findOpenPullRequest: async () => (state.openSetupPr ? { number: 3, htmlUrl: 'pr/3' } : null),
    getBranchSha: async (branch: string) => (branch === 'main' ? 'base' : null),
    getCommitTree: async () => 'tree',
    createTree: async (_base: string, entries: unknown) => {
      writes.push(['createTree', entries]);
      return 'newtree';
    },
    createCommit: async () => 'commit',
    createBranch: async (branch: string, sha: string) => void writes.push(['createBranch', { branch, sha }]),
    updateBranch: async () => undefined,
    createPullRequest: async (opts: unknown) => {
      writes.push(['createPullRequest', opts]);
      return { number: 9, htmlUrl: 'pr/9' };
    },
  };
  return { client: client as unknown as GitHubClient, writes };
}

const texts = { prTitle: 'Configurar verificações', prBody: 'corpo', commitMessage: 'ci: verificações' };

describe('planSetup', () => {
  it('repositório vazio, admin: tudo', async () => {
    const { client } = fakeClient({});
    expect((await planSetup(client)).steps).toEqual(['workflow', 'markdownlint', 'merge', 'ruleset']);
  });

  it('repositório já configurado (como a wiki da demo): nada', async () => {
    const { client } = fakeClient({
      hasWorkflows: true,
      files: ['.markdownlint.yaml', '.github/workflows/techdocs.yml'],
      squash: true,
      requiresPullRequest: true,
      requiredChecks: SETUP_CHECK_NAMES,
    });
    expect((await planSetup(client)).steps).toEqual([]);
  });

  it('pipeline própria: não troca o workflow; ruleset sem exigir checks de nome desconhecido', async () => {
    const { client } = fakeClient({ hasWorkflows: true, files: ['.markdownlint.json'], squash: true });
    const plan = await planSetup(client);
    expect(plan.steps).toEqual(['ruleset']);
    expect(plan.hasStandardChecks).toBe(false);
  });

  it('checks padrão já na main, ruleset sem eles: o ruleset passa a exigi-los', async () => {
    const { client } = fakeClient({
      hasWorkflows: true,
      files: ['.markdownlint.yaml', SETUP_WORKFLOW_PATH],
      squash: true,
      requiresPullRequest: true,
    });
    expect((await planSetup(client)).steps).toEqual(['ruleset']);
  });

  it('repositório recém-criado pelo template: o GitHub ainda não lista o workflow, mas o arquivo está lá', async () => {
    const { client } = fakeClient({
      hasWorkflows: false,
      files: ['.markdownlint.yaml', '.github/workflows/techdocs.yml'],
      squash: true,
    });
    expect((await planSetup(client)).steps).toEqual(['ruleset']);
  });

  it('CI de fora do GitHub Actions com checks obrigatórios (ex.: Jenkins): não oferece o workflow padrão', async () => {
    const { client } = fakeClient({ requiresPullRequest: true, requiredChecks: ['continuous-integration/jenkins/pr-merge'] });
    expect((await planSetup(client)).steps).not.toContain('workflow');
  });

  it('o time disse no .techdocs-editor.yaml que tem pipeline própria, ou que não quer uma: sem workflow padrão', async () => {
    for (const mode of ['pipeline', 'editor']) {
      const { client } = fakeClient({
        files: ['.techdocs-editor.yaml'],
        contents: { '.techdocs-editor.yaml': `verification:\n  mode: ${mode}\n` },
      });
      expect((await planSetup(client)).steps).not.toContain('workflow');
    }
    const { client } = fakeClient({ files: ['.techdocs-editor.yaml'], contents: { '.techdocs-editor.yaml': 'verification:\n  mode: auto\n' } });
    expect((await planSetup(client)).steps).toContain('workflow');
  });

  it('quem não é admin não vê passos de configuração do repositório', async () => {
    const { client } = fakeClient({ isAdmin: false });
    expect((await planSetup(client)).steps).toEqual(['workflow', 'markdownlint']);
  });
});

describe('applySetup', () => {
  it('admin: merge por squash e ruleset na hora; arquivos num PR (não rascunho)', async () => {
    const { client, writes } = fakeClient({});
    const result = await applySetup(client, await planSetup(client), { ...texts, requiredApprovals: 1 });

    expect(result.applied).toEqual(['merge', 'ruleset', 'workflow', 'markdownlint']);
    expect(result.pullRequest?.number).toBe(9);
    expect(writes.find(([w]) => w === 'updateRepo')?.[1]).toEqual(SQUASH_MERGE_SETTINGS);
    const ruleset = writes.find(([w]) => w === 'saveRuleset')?.[1] as any;
    expect(ruleset.name).toBe(SETUP_RULESET_NAME);
    expect(ruleset.rules.find((r: any) => r.type === 'pull_request').parameters.required_approving_review_count).toBe(1);
    // Sem isto, o GitHub pede uma aprovação extra mesmo com 0 exigidas
    expect(ruleset.rules.find((r: any) => r.type === 'pull_request').parameters.require_extra_approval_for_unattributed_changes).toBe(false);
    // O workflow ainda não está na main: exigir os checks travaria todos os PRs
    expect(ruleset.rules.some((r: any) => r.type === 'required_status_checks')).toBe(false);
    expect(writes.find(([w]) => w === 'createTree')?.[1]).toEqual([
      { path: SETUP_WORKFLOW_PATH, content: SETUP_WORKFLOW },
      expect.objectContaining({ path: '.markdownlint.yaml' }),
    ]);
    expect(writes.find(([w]) => w === 'createBranch')?.[1]).toEqual({ branch: SETUP_BRANCH, sha: 'commit' });
    expect(writes.find(([w]) => w === 'createPullRequest')?.[1]).toMatchObject({ draft: false, base: 'main' });
  });

  it('com os checks padrão na main, o ruleset os exige', async () => {
    const { client, writes } = fakeClient({ hasWorkflows: true, files: ['.markdownlint.yaml', '.github/workflows/techdocs.yml'], squash: true });
    await applySetup(client, await planSetup(client), texts);

    const ruleset = writes.find(([w]) => w === 'saveRuleset')?.[1] as any;
    const checks = ruleset.rules.find((r: any) => r.type === 'required_status_checks');
    expect(checks.parameters.required_status_checks.map((c: any) => c.context)).toEqual(SETUP_CHECK_NAMES);
  });

  it('quem não é admin só abre o PR', async () => {
    const { client, writes } = fakeClient({ isAdmin: false });
    const result = await applySetup(client, await planSetup(client), texts);
    expect(result.applied).toEqual(['workflow', 'markdownlint']);
    expect(writes.map(([w]) => w)).not.toContain('updateRepo');
    expect(writes.map(([w]) => w)).not.toContain('saveRuleset');
  });

  it('rodar de novo com o PR do setup aberto reaproveita o PR', async () => {
    const { client, writes } = fakeClient({ isAdmin: false, openSetupPr: true });
    const result = await applySetup(client, await planSetup(client), texts);
    expect(result.pullRequest?.number).toBe(3);
    expect(writes).toEqual([]);
  });
});
