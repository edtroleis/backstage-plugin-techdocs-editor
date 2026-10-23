# TechDocs Editor

**English** · [Português](README.pt-BR.md)

A visual editor for TechDocs pages, for people who don't know Git: they click the pencil on a page,
write in something that looks like a regular text editor and publish. Underneath it is the same flow
as any code change on GitHub: branch, pull request, pipeline checks and merge.

- **Visual editor and Markdown view** (Milkdown + CodeMirror), with a faithful round trip of MkDocs
  Markdown (admonitions, content tabs, tables, images): what was not edited does not change.
- **Lint while typing**, with the repository's own `.markdownlint.*` rules (the same the pipeline
  uses) and automatic fixes.
- **Save draft** (just stores it, no pipeline), **Save and check** (draft pull request + pipeline),
  **Send for publication / for review** (the label follows the branch rules on GitHub) and **Discard**.
- **Pipeline checks in plain language**, with "show line" at the problem.
- **Conflicts**: the draft receives what was published in the meantime; when the same lines changed,
  the person picks what stays.
- **Page history**, with "Restore" for an earlier version.
- On the TechDocs page: an "Edit" pencil (with a dot when there is a draft), a notice about changes
  waiting to be published, and the creation and update dates at the top.
- **Repository setup**: admins get a "Set up checks" button (workflow, lint rules, squash merge,
  ruleset), also available as the Scaffolder action `techdocs-editor:setup`.
- Texts in English (default) and Brazilian Portuguese.

GitHub decides who can write: the editor acts with the person's own GitHub token.

## Packages

| Package | Contents |
|---------|----------|
| `@edtroleis/plugin-techdocs-editor` | Editor page and TechDocs addon (this package) |
| `@edtroleis/plugin-techdocs-editor-common` | Core without React: MkDocs Markdown, lint, three-way merge, GitHub client, repository setup |
| `@edtroleis/plugin-scaffolder-backend-module-techdocs-editor` | Scaffolder action `techdocs-editor:setup` |

## Installation

1. Add the package to the app:

   ```bash
   yarn --cwd packages/app add @edtroleis/plugin-techdocs-editor
   ```

2. Register the page and the TechDocs addon.

   **New frontend system**: with `app.packages: all` the page is discovered; the TechDocs addon is
   a separate module:

   ```tsx
   // packages/app/src/App.tsx
   import techdocsEditorPlugin, { techdocsEditorTechDocsModule } from '@edtroleis/plugin-techdocs-editor/alpha';

   export default createApp({
     features: [techdocsEditorPlugin, techdocsEditorTechDocsModule],
   });
   ```

   The page is at `/docs-editor`. To change the path or the title:
   `app.extensions: [{ 'page:techdocs-editor': { config: { path, title } } }]`.

   **Legacy frontend system**:

   ```tsx
   // packages/app/src/App.tsx
   import { TechDocsEditorPage, TechDocsEditAddon } from '@edtroleis/plugin-techdocs-editor';

   <Route path="/docs-editor" element={<TechDocsEditorPage />} />

   <Route path="/docs/:namespace/:kind/:name/*" element={<TechDocsReaderPage />}>
     <TechDocsAddons>
       <TechDocsEditAddon />
     </TechDocsAddons>
   </Route>
   ```

3. Configure GitHub sign-in in Backstage (`auth.providers.github`, an OAuth App or a GitHub App).
   Signing in to the portal can stay with your current provider: the editor asks for GitHub (popup)
   only when someone clicks the pencil.

## Configuration

Everything is optional (schema in `config.d.ts`):

```yaml
techdocsEditor:
  github:
    auth: user            # user (default) | proxy (demo only)
    host: github.com      # when the documentation does not say; the API URL comes from integrations.github
    scopes: [repo]        # [public_repo] is enough for wikis in public repositories only
  branchPattern: 'docs/{login}/{path}'
  drafts:
    skipCi: true          # "Save draft" commits with [skip ci]
  verification:
    mode: auto            # auto | pipeline | editor
    startTimeoutSeconds: 120
    checkHelp:            # plain-language message per pipeline job name
      Links: Some links don't work.
  images:
    maxSizeMB: 5          # largest image the editor uploads to the repository
  polling:
    intervalSeconds: 8        # while a check runs or a pull request waits to be published
    idleIntervalSeconds: 60   # otherwise; nothing while the browser tab is in the background
```

Per documentation, the annotation `techdocs-editor/verification: pipeline | editor` overrides the
configuration.

### Checks: with and without a pipeline

| Repository | What "Save and check" verifies | Sending |
|------------|--------------------------------|---------|
| With workflows or required checks (`mode: auto` detects it) | The GitHub checks on the pull request, whatever the job names | Allowed when no check failed |
| Without workflows (`mode: auto` detects it) or `mode: editor` | The editor's lint with the repository's rules; the panel explains there are no automatic checks | Allowed when the lint passes |

If no check starts within `startTimeoutSeconds`, the panel says so and links the pull request.

### Usage modes

| Mode | Portal sign-in | Who sees the pencil | Writing on GitHub |
|------|----------------|---------------------|-------------------|
| Demo | Guest | Documentation owner, or everyone (*allow all* policy) | `auth: proxy`: a service account, through the backend proxy endpoint `techdocs-editor-github`; the editor shows a warning |
| PoC | Guest or your provider | Documentation owner (before GitHub sign-in) | The person's own token |
| Production | Your provider | Permission `techdocs-editor.page.edit` (below) | The person's own token |

The `proxy` mode needs the backend proxy endpoint, with a service account token:

```yaml
proxy:
  endpoints:
    /techdocs-editor-github:
      target: https://api.github.com
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
      allowedMethods: [GET, POST, PUT, PATCH, DELETE]
      credentials: require   # signed-in portal users only
```

### Permission

`-common` exports `techdocsEditorEditPermission` (`techdocs-editor.page.edit`), a resource
permission on the catalog entity. It decides whether the pencil shows and whether the editor opens;
writing still depends on GitHub. In a policy, for example, only the documentation owner:

```ts
if (isPermission(request.permission, techdocsEditorEditPermission)) {
  return createCatalogConditionalDecision(request.permission, catalogConditions.isEntityOwner({
    claims: user?.info.ownershipEntityRefs ?? [],
  }));
}
```

Without the permission framework (or with *allow all*), everyone may; then only GitHub decides.

### GitHub Enterprise

The host comes from the documentation's `backstage.io/source-location` (or
`techdocsEditor.github.host`), and the API URL from that host's entry in `integrations.github`.
Backstage's GitHub sign-in must point to the same Enterprise
(`auth.providers.github.<env>.enterpriseInstanceUrl`).

### Texts and languages

English is the default and Brazilian Portuguese is included. The app picks the language
(`api:app/app-language`). To change texts or add a language, use `techdocsEditorTranslationRef`
from `@edtroleis/plugin-techdocs-editor/alpha` with Backstage's translation API.

## Documentation requirements

- Annotations `backstage.io/techdocs-ref` and `github.com/project-slug` in `catalog-info.yaml`.
- **Squash** merge with the pull request description as the message: drafts use `[skip ci]`, and the
  default squash message would carry the marker to the main branch.
- Page dates come from the MkDocs plugin `git-revision-date-localized`. If Backstage builds the docs
  itself (`techdocs.builder: local`), allow the plugin, since Backstage drops MkDocs plugins outside
  its allowlist:

  ```yaml
  techdocs:
    generator:
      mkdocs:
        dangerouslyAllowAdditionalPlugins: [git-revision-date-localized]
  ```

The repository setup below checks and fixes the first two.

## Repository setup

What the editor needs to check every change is applied in two ways, with the same logic
(`planSetup`/`applySetup` in `-common`). Only what is missing is done, so it can run again:

| Step | When it is missing | How it is applied |
|------|--------------------|-------------------|
| `workflow` | No workflow in the repository | Pull request with `.github/workflows/techdocs-checks.yml` (the 4 checks, on pull requests only) |
| `markdownlint` | No `.markdownlint.*` | Same pull request, `.markdownlint.yaml` with rules for beginners |
| `merge` | Merge is not squash-only with the pull request title and description | Right away (admin) |
| `ruleset` | The main branch accepts changes without a pull request, or already runs the default checks without requiring them | Right away (admin): ruleset `techdocs-editor` requiring a pull request and, when the default workflow is on the branch, the 4 checks |

- **In the editor**: repository admins see "Set up checks" in the panel when something is
  missing. The confirmation says what changes right away and what goes in a pull request. Creating
  the workflow asks GitHub for the `workflow` scope at that moment.
- **In the Scaffolder**: the action `techdocs-editor:setup` (see
  [its package](../scaffolder-backend-module-techdocs-editor/README.md)).

An existing pipeline is not replaced: the ruleset then requires a pull request, but not checks it
does not know.

## Security

- **GitHub token**: comes from Backstage's GitHub sign-in and stays in browser memory; the editor
  neither stores nor logs it, and asks the session for it on every call (a token GitHub replaced is
  renewed). `localStorage` only holds the text of a draft not saved yet.
- **Least privilege**: the OAuth App scope `repo` grants write access to *every* repository the
  person can reach, not only the wikis. In order of preference:
  1. a **GitHub App** instead of the OAuth App (`auth.providers.github` accepts an App): the token
     only works where the App is installed, with `contents: write`, `pull_requests: write`,
     `checks: read`, `metadata: read` (and `workflows: write` for the setup);
  2. wikis in public repositories only: `scopes: [public_repo]`;
  3. OAuth App with `repo` (default), accepting the reach above.
- **Browser**: restrict the CSP `connect-src` to the backend and the configured GitHub API:

  ```yaml
  backend:
    csp:
      connect-src: ["'self'", 'https://api.github.com'] # GitHub Enterprise: https://<host>/api/v3
  ```

- **Content**: uploaded images must be `image/*` and at most `images.maxSizeMB`; hostile HTML in
  Markdown (scripts, `javascript:` links) is covered by the tests in `e2e/tests`.
- **`proxy` mode**: everyone writes as the same service account. Demo only.
- **markdownlint** is bundled in `-common` (`src/vendor/markdownlint.js`, generated from the exact
  version in its `package.json`, which stays a dependency so audits see it): the original package
  makes Backstage's bundler show a "Critical dependency" warning.

## Development

From the repository root:

```bash
pip install -r requirements-docs.txt   # MkDocs, for the example wiki's TechDocs
yarn start                             # development app at http://localhost:3000 (guest sign-in)
yarn test:editor                       # unit tests + the editor in the browser
yarn test:editor:portal                # the editor inside the app, with a simulated GitHub
```
