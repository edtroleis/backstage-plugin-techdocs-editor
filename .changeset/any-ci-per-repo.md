---
'@edtroleis/plugin-techdocs-editor': minor
'@edtroleis/plugin-techdocs-editor-common': minor
---

Works with any CI, per repository:

- Commit statuses (Jenkins, CircleCI and other external CIs) show and gate sending, together with
  check runs.
- Required checks from classic branch protection count, not only rulesets, so `mode: auto` detects
  pipelines outside GitHub Actions.
- `.techdocs-editor.yaml` in the documentation repository sets `verification.mode`,
  `startTimeoutSeconds` and `checkHelp` for that repository (catalog annotation, then the file, then
  app-config). The setup no longer offers the default workflow to repositories with their own CI.
