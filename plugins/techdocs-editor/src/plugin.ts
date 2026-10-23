import { createPlugin, createRoutableExtension } from '@backstage/core-plugin-api';
import {
  createTechDocsAddonExtension,
  TechDocsAddonLocations,
} from '@backstage/plugin-techdocs-react';
import { EditPageAddon } from './EditPageAddon';
import { rootRouteRef } from './routes';

/**
 * Editor visual de docs para o sistema de frontend antigo (`App.tsx` com rotas). Para o novo
 * sistema, use a entrada `/alpha` deste pacote.
 *
 * @public
 */
export const techdocsEditorPlugin = createPlugin({
  id: 'techdocs-editor',
  routes: { root: rootRouteRef },
});

/**
 * Página do editor: monte numa rota (ex.: `<Route path="/docs-editor" element={<TechDocsEditorPage />} />`).
 *
 * @public
 */
export const TechDocsEditorPage = techdocsEditorPlugin.provide(
  createRoutableExtension({
    name: 'TechDocsEditorPage',
    component: () => import('./EditorPage').then(m => m.EditorPage),
    mountPoint: rootRouteRef,
  }),
);

/**
 * Lápis "Editar" e datas da página: coloque dentro de `<TechDocsAddons>` na rota do leitor do TechDocs.
 *
 * @public
 */
export const TechDocsEditAddon = techdocsEditorPlugin.provide(
  createTechDocsAddonExtension({
    name: 'TechDocsEditAddon',
    location: TechDocsAddonLocations.Subheader,
    component: EditPageAddon,
  }),
);
