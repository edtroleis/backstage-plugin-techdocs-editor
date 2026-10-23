import { ConfigReader } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { SETUP_CHECK_NAMES } from '@edtroleis/plugin-techdocs-editor-common';
import { createTechdocsEditorSetupAction } from './setupAction';

/** GitHub de um repositório recém-criado pelo template Nova Wiki: workflow e lint já vêm do skeleton. */
function fakeGitHub() {
  const calls: Array<{ method: string; path: string; body?: any; auth?: string }> = [];
  const fetch = jest.fn(async (url: string, init: RequestInit) => {
    const path = new URL(url).pathname;
    const method = init.method ?? 'GET';
    calls.push({
      method,
      path,
      body: init.body ? JSON.parse(String(init.body)) : undefined,
      auth: (init.headers as Record<string, string>).Authorization,
    });
    const json = (data: unknown) => new Response(JSON.stringify(data));
    if (method === 'GET' && path === '/repos/dono/docs-editor-wiki-time') {
      return json({
        default_branch: 'main',
        html_url: 'https://github.com/dono/docs-editor-wiki-time',
        permissions: { push: true, admin: true },
        allow_squash_merge: true,
        allow_merge_commit: false,
        allow_rebase_merge: false,
        squash_merge_commit_title: 'PR_TITLE',
        squash_merge_commit_message: 'PR_BODY',
      });
    }
    if (path.endsWith('/actions/workflows')) return json({ total_count: 1 });
    if (path.endsWith('/contents/.markdownlint.yaml') || path.endsWith('/contents/.github/workflows/techdocs.yml')) {
      return json({ content: '', sha: 'x' });
    }
    if (path.includes('/contents/')) return new Response('{}', { status: 404 });
    if (path.includes('/rules/branches/')) return json([]);
    if (path.endsWith('/branches/main')) return json({ name: 'main', protected: false });
    if (method === 'GET' && path.endsWith('/rulesets')) return json([]);
    if (method === 'POST' && path.endsWith('/rulesets')) return json({ id: 1 });
    return new Response(JSON.stringify({ message: `não simulado: ${method} ${path}` }), { status: 501 });
  });
  return { fetch, calls };
}

describe('techdocs-editor:setup', () => {
  const integrations = ScmIntegrations.fromConfig(new ConfigReader({ integrations: { github: [{ host: 'github.com' }] } }));
  const original = global.fetch;
  afterEach(() => {
    global.fetch = original;
  });

  it('wiki nova do template: só cria o ruleset, exigindo os 4 checks e a aprovação pedida', async () => {
    const github = fakeGitHub();
    global.fetch = github.fetch as any;
    const output = jest.fn();
    const action = createTechdocsEditorSetupAction({ integrations });

    await action.handler({
      input: { repoUrl: 'github.com?owner=dono&repo=docs-editor-wiki-time', requiredApprovals: 1, token: 'tok' },
      logger: { info: jest.fn(), warn: jest.fn() },
      output,
    } as any);

    const writes = github.calls.filter(c => c.method !== 'GET');
    expect(writes.map(c => `${c.method} ${c.path}`)).toEqual(['POST /repos/dono/docs-editor-wiki-time/rulesets']);
    const rules = writes[0].body.rules;
    expect(rules.find((r: any) => r.type === 'pull_request').parameters.required_approving_review_count).toBe(1);
    expect(
      rules.find((r: any) => r.type === 'required_status_checks').parameters.required_status_checks.map((c: any) => c.context),
    ).toEqual(SETUP_CHECK_NAMES);
    expect(github.calls.every(c => c.auth === 'Bearer tok')).toBe(true);
    expect(output).toHaveBeenCalledWith('applied', ['ruleset']);
  });

  it('dry-run: confere as entradas e não chama o GitHub', async () => {
    const github = fakeGitHub();
    global.fetch = github.fetch as any;
    const output = jest.fn();

    await createTechdocsEditorSetupAction({ integrations }).handler({
      input: { repoUrl: 'github.com?owner=dono&repo=docs-editor-wiki-time', requiredApprovals: 0 },
      isDryRun: true,
      logger: { info: jest.fn(), warn: jest.fn() },
      output,
    } as any);

    expect(github.calls).toEqual([]);
    expect(output).toHaveBeenCalledWith('applied', []);
  });
});
