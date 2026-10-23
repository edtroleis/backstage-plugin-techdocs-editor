---
'@edtroleis/plugin-techdocs-editor': patch
---

Without GitHub sign-in configured in Backstage (`auth.providers.github`), the editor now explains
what is missing instead of opening a sign-in popup that shows "No auth provider registered for 'github'".
