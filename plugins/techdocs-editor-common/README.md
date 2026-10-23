# TechDocs Editor (common)

**English** · [Português](README.pt-BR.md)

Core of [`@edtroleis/plugin-techdocs-editor`](../techdocs-editor/README.md), without React:

- `toEditor` / `fromEditor`: MkDocs Markdown to the editor and back, without changing what was not
  edited (admonitions, content tabs and other blocks the editor does not know pass through protected);
- `lintFindings` / `fixLintProblems`: markdownlint with the repository's configuration;
- `merge3`: line-based three-way merge, like Git's, with the conflicting hunks;
- `GitHubClient`: the GitHub API calls the editor makes (files, branches, pull requests, checks);
- `loadSession`, `syncWithMain`: an editing session for one page and syncing the draft with the
  published version;
- `planSetup` / `applySetup`: the repository setup;
- `techdocsEditorEditPermission`: the permission `techdocs-editor.page.edit`.

Used by the plugin; no need to install it separately (except to use the permission in a policy).
