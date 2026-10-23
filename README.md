# TechDocs Editor for Backstage

A visual editor for [TechDocs](https://backstage.io/docs/features/techdocs/) pages, for people who
don't know Git: click the pencil on a page, write, publish. Underneath it is the usual GitHub flow
(branch, pull request, checks, merge), with the person's own GitHub permissions.

| Package | npm |
|---------|-----|
| [`@edtroleis/plugin-techdocs-editor`](plugins/techdocs-editor/README.md): editor page and TechDocs addon | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-techdocs-editor)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor) |
| [`@edtroleis/plugin-techdocs-editor-common`](plugins/techdocs-editor-common/README.md): core (Markdown, lint, merge, GitHub client) | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-techdocs-editor-common)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor-common) |
| [`@edtroleis/plugin-scaffolder-backend-module-techdocs-editor`](plugins/scaffolder-backend-module-techdocs-editor/README.md): Scaffolder action `techdocs-editor:setup` | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-scaffolder-backend-module-techdocs-editor)](https://www.npmjs.com/package/@edtroleis/plugin-scaffolder-backend-module-techdocs-editor) |

Installation, configuration and security: [plugin README](plugins/techdocs-editor/README.md).

## Development

Requirements: Node 22 or 24 (`.nvmrc`), Yarn via Corepack, Python 3 for MkDocs.

```bash
corepack enable
yarn install
python3 -m venv .venv && .venv/bin/pip install -r requirements-docs.txt
PATH="$PWD/.venv/bin:$PATH" yarn start   # http://localhost:3000, sign in as guest
```

The development app (`packages/app`, `packages/backend`) shows an example wiki
(`plugins/techdocs-editor/e2e/portal/wiki-fixture`).

### Signing in with GitHub

Without GitHub sign-in the editor opens with a message saying it is not configured (the portal tests
simulate GitHub instead). To edit for real:

1. Create a GitHub OAuth App (GitHub → Settings → Developer settings → OAuth Apps) with
   homepage `http://localhost:3000` and callback URL `http://localhost:7007/api/auth/github/handler/frame`.
2. Start the app with its credentials:

   ```bash
   export AUTH_GITHUB_CLIENT_ID=<client id> AUTH_GITHUB_CLIENT_SECRET=<client secret>
   PATH="$PWD/.venv/bin:$PATH" yarn start
   ```

3. Register a documentation repository you can write to, in `app-config.local.yaml` (not committed):

   ```yaml
   catalog:
     locations:
       - type: url
         target: https://github.com/<owner>/<repo>/blob/main/catalog-info.yaml
   ```

   The example wiki points to `edtroleis/docs-editor-wiki-demo`: editing it for real opens pull
   requests there.

| Command | What it does |
|---------|--------------|
| `yarn test:editor` | Unit tests and the editor in the browser (Playwright) |
| `yarn test:editor:portal` | The editor inside the development app, with a simulated GitHub (starts the app if needed) |
| `yarn tsc`, `yarn lint:all`, `yarn knip:editor` | Types, lint, unused code |
| `yarn changeset` | Describe a change for the next release |

## Releases

[Changesets](https://github.com/changesets/changesets): each pull request that changes a package adds
a changeset; the Release workflow opens a "Version Packages" pull request, and merging it submits
the new versions to npm (with provenance) for a maintainer to approve with 2FA.

## License

[Apache-2.0](LICENSE). `@edtroleis/plugin-techdocs-editor-common` bundles markdownlint and its
dependencies (MIT); their licenses are in
[`THIRD_PARTY_NOTICES.md`](plugins/techdocs-editor-common/THIRD_PARTY_NOTICES.md), published with the package.
