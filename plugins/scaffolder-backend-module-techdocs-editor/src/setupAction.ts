import { InputError } from '@backstage/errors';
import { GithubCredentialsProvider, ScmIntegrationRegistry } from '@backstage/integration';
import { getOctokitOptions } from '@backstage/plugin-scaffolder-backend-module-github';
import { createTemplateAction, parseRepoUrl } from '@backstage/plugin-scaffolder-node';
import { applySetup, GitHubClient, planSetup, userTransport } from '@edtroleis/plugin-techdocs-editor-common';

const PR_BODY = `Adds what the docs editor needs to check every change before it is published:

- \`.github/workflows/techdocs-checks.yml\`: text formatting, links, sensitive data and a docs build on every pull request;
- \`.markdownlint.yaml\`: the same Markdown rules the editor shows while people write.

Only the files missing from this repository are included. After this merge, run the setup again (or click "Set up checks" in the editor) so the branch ruleset requires these checks.`;

/**
 * `techdocs-editor:setup`: prepara um repositório de documentação para o editor. Merge por squash e
 * ruleset na hora (o token precisa ser admin do repositório); workflow e regras do lint num PR.
 * Só faz o que falta, então pode rodar de novo.
 */
export function createTechdocsEditorSetupAction(options: {
  integrations: ScmIntegrationRegistry;
  credentialsProvider?: GithubCredentialsProvider;
}) {
  const { integrations, credentialsProvider } = options;
  return createTemplateAction({
    id: 'techdocs-editor:setup',
    // Dry-run (editor de templates): confere as entradas sem tocar no GitHub
    supportsDryRun: true,
    description:
      'Prepares a documentation repository for the TechDocs editor: checks on pull requests, Markdown rules, squash merge with the PR message and a ruleset for the default branch. Only applies what is missing.',
    examples: [
      {
        description: 'Wiki that publishes without review',
        example: [
          'steps:',
          '  - id: setup',
          '    action: techdocs-editor:setup',
          '    input:',
          "      repoUrl: github.com?owner=my-org&repo=wiki-team",
        ].join('\n'),
      },
      {
        description: 'Official policy: one approval required',
        example: [
          'steps:',
          '  - id: setup',
          '    action: techdocs-editor:setup',
          '    input:',
          "      repoUrl: github.com?owner=my-org&repo=policies",
          '      requiredApprovals: 1',
        ].join('\n'),
      },
    ],
    schema: {
      input: {
        repoUrl: z => z.string({ description: 'Repository, as in publish:github (github.com?owner=<owner>&repo=<repo>)' }),
        requiredApprovals: z =>
          z.number({ description: 'Approvals the ruleset requires before merging (default 0)' }).int().min(0).max(6).optional(),
        token: z => z.string({ description: 'GitHub token; by default, the one from the GitHub integration' }).optional(),
      },
      output: {
        applied: z => z.array(z.string(), { description: 'What was changed: workflow, markdownlint, merge, ruleset' }),
        pullRequestUrl: z => z.string({ description: 'Pull request with the new files, when there is one' }).optional(),
      },
    },
    async handler(ctx) {
      const { host, owner, repo } = parseRepoUrl(ctx.input.repoUrl, integrations);
      if (!owner) throw new InputError('repoUrl has no owner');
      if (ctx.isDryRun) {
        ctx.logger.info(`Dry run: would set up ${owner}/${repo} with ${ctx.input.requiredApprovals ?? 0} required approval(s)`);
        ctx.output('applied', []);
        return;
      }
      const octokit = await getOctokitOptions({
        integrations,
        credentialsProvider,
        token: ctx.input.token,
        host,
        owner,
        repo,
      });
      const client = new GitHubClient(userTransport(String(octokit.auth), octokit.baseUrl), `${owner}/${repo}`);

      const plan = await planSetup(client);
      if (!plan.isAdmin && plan.steps.some(step => step === 'merge' || step === 'ruleset')) {
        ctx.logger.warn('The token is not an admin of the repository: merge settings and ruleset were skipped');
      }
      const result = await applySetup(client, plan, {
        requiredApprovals: ctx.input.requiredApprovals,
        prTitle: 'Set up checks for the docs editor',
        prBody: PR_BODY,
        commitMessage: 'ci: checks for the docs editor',
      });
      ctx.logger.info(result.applied.length ? `Applied: ${result.applied.join(', ')}` : 'Nothing to do: the repository is already set up');
      ctx.output('applied', result.applied);
      if (result.pullRequest) ctx.output('pullRequestUrl', result.pullRequest.htmlUrl);
    },
  });
}
