import { createApp } from '@backstage/frontend-defaults';
import techdocsEditorPlugin, { techdocsEditorTechDocsModule } from '@edtroleis/plugin-techdocs-editor/alpha';

// Development app: catalog and TechDocs come from `app.packages: all`; the editor is added here the
// same way an adopter's app does it (see plugins/techdocs-editor/README.md)
export default createApp({
  features: [techdocsEditorPlugin, techdocsEditorTechDocsModule],
});
