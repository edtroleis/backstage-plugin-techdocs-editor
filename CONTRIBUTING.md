# Contributing

1. Open an issue first for larger changes.
2. Run `yarn tsc`, `yarn lint:all`, `yarn knip:editor` and `yarn test:editor` (and
   `yarn test:editor:portal` for changes in the editor page or the TechDocs addon).
3. Add a changeset (`yarn changeset`) when a published package changes.
4. Every editor feature is tested by inserting **and** removing what it offers, not only the happy
   path; texts go through `techdocsEditorTranslationRef` in English and Brazilian Portuguese.
5. After changing the markdownlint version: `yarn workspace @edtroleis/plugin-techdocs-editor-common bundle:markdownlint`.
