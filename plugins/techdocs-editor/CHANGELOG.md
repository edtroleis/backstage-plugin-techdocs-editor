# @edtroleis/plugin-techdocs-editor

## 0.2.0

### Minor Changes

- f7ca14b: Works with any CI, per repository:

  - Commit statuses (Jenkins, CircleCI and other external CIs) show and gate sending, together with
    check runs.
  - Required checks from classic branch protection count, not only rulesets, so `mode: auto` detects
    pipelines outside GitHub Actions.
  - `.techdocs-editor.yaml` in the documentation repository sets `verification.mode`,
    `startTimeoutSeconds` and `checkHelp` for that repository (catalog annotation, then the file, then
    app-config). The setup no longer offers the default workflow to repositories with their own CI.

### Patch Changes

- 1dcac8d: Without GitHub sign-in configured in Backstage (`auth.providers.github`), the editor now explains
  what is missing instead of opening a sign-in popup that shows "No auth provider registered for 'github'".
- 40e7301: Typing right after creating a list item no longer scrambles the letters on a busy machine ("oisd"
  instead of "dois"): the list item view of Milkdown restored a stale cursor position one animation
  frame after mounting.
- e1ecd47: README with short videos of the editor working and badges.
- Updated dependencies [f7ca14b]
  - @edtroleis/plugin-techdocs-editor-common@0.2.0
