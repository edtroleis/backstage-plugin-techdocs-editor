---
'@edtroleis/plugin-techdocs-editor': patch
---

The editor is styled again when installed from npm: the Milkdown Crepe theme is bundled in the
package (`src/vendor/crepe-theme.css`) instead of an `@import` the browser cannot resolve, and
`sideEffects` covers the CSS modules the build generates, so bundlers no longer drop them.
