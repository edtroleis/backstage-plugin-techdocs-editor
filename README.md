# TechDocs Editor for Backstage

[![CI](https://github.com/edtroleis/backstage-plugin-techdocs-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/edtroleis/backstage-plugin-techdocs-editor/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@edtroleis/plugin-techdocs-editor?label=npm)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor)
[![npm provenance](https://img.shields.io/badge/npm-provenance-blue)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor#provenance)
[![Backstage](https://img.shields.io/badge/Backstage-1.56-36BAA2?logo=backstage&logoColor=white)](https://backstage.io)
[![License](https://img.shields.io/github/license/edtroleis/backstage-plugin-techdocs-editor)](https://github.com/edtroleis/backstage-plugin-techdocs-editor/blob/main/LICENSE)

A visual editor for [TechDocs](https://backstage.io/docs/features/techdocs/) pages, for people who
don't know Git: click the pencil on a page, write, publish. Underneath it is the usual GitHub flow
(branch, pull request, checks, merge), with the person's own GitHub permissions.

| Package | npm |
|---------|-----|
| [`@edtroleis/plugin-techdocs-editor`](plugins/techdocs-editor/README.md): editor page and TechDocs addon | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-techdocs-editor)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor) |
| [`@edtroleis/plugin-techdocs-editor-common`](plugins/techdocs-editor-common/README.md): core (Markdown, lint, merge, GitHub client) | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-techdocs-editor-common)](https://www.npmjs.com/package/@edtroleis/plugin-techdocs-editor-common) |
| [`@edtroleis/plugin-scaffolder-backend-module-techdocs-editor`](plugins/scaffolder-backend-module-techdocs-editor/README.md): Scaffolder action `techdocs-editor:setup` | [![npm](https://img.shields.io/npm/v/@edtroleis/plugin-scaffolder-backend-module-techdocs-editor)](https://www.npmjs.com/package/@edtroleis/plugin-scaffolder-backend-module-techdocs-editor) |

Installation, configuration and security: [plugin README](plugins/techdocs-editor/README.md).

## See it working

| Edit and publish | Checks in plain language | Markdown view and lint |
|:---:|:---:|:---:|
| ![Click the pencil on a TechDocs page, write in the visual editor, save and check, send for publication](https://raw.githubusercontent.com/edtroleis/backstage-plugin-techdocs-editor/main/docs/media/edit-and-publish.gif) | ![A failed check explained in plain language; "show line" opens the Markdown at the problem](https://raw.githubusercontent.com/edtroleis/backstage-plugin-techdocs-editor/main/docs/media/checks-in-plain-language.gif) | ![Switch to the Markdown view; the lint points out problems while typing](https://raw.githubusercontent.com/edtroleis/backstage-plugin-techdocs-editor/main/docs/media/markdown-and-lint.gif) |
| Pencil on the page, visual editor, draft pull request, checks, send | A failed check in plain language; "show line" goes to the problem | Same document as Markdown, lint while typing |

The videos are recorded from the development app with a simulated GitHub (`yarn record:videos`).

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
