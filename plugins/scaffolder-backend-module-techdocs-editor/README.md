# techdocs-editor:setup

**English** · [Português](README.pt-BR.md)

Scaffolder module with the action `techdocs-editor:setup`: prepares a documentation repository for
the [TechDocs editor](../techdocs-editor/README.md). Only what is missing is applied, so it can run
again.

- Squash-only merge with the pull request title and description, and a ruleset on the main branch
  (pull request required and, when the default workflow is there, the 4 checks): right away. The
  token must be a repository admin.
- Checks workflow and `.markdownlint.yaml`, when missing: in a pull request from the branch
  `techdocs-editor/setup`.

```bash
yarn --cwd packages/backend add @edtroleis/plugin-scaffolder-backend-module-techdocs-editor
```

```ts
// packages/backend/src/index.ts
backend.add(import('@edtroleis/plugin-scaffolder-backend-module-techdocs-editor'));
```

```yaml
steps:
  - id: setup
    action: techdocs-editor:setup
    input:
      repoUrl: github.com?owner=my-org&repo=wiki-team
      requiredApprovals: 1 # optional; default 0
```

The token is the GitHub integration's (or `token` in the input). Outputs: `applied` (what changed:
`workflow`, `markdownlint`, `merge`, `ruleset`) and `pullRequestUrl` (when a pull request was
opened). The logic lives in `@edtroleis/plugin-techdocs-editor-common` (`planSetup`/`applySetup`),
the same as the editor's "Set up checks" button. More in the
[plugin README](../techdocs-editor/README.md#repository-setup).
