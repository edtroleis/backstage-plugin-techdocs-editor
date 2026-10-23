import { convertLegacyRouteRef } from '@backstage/core-compat-api';
import {
  createFrontendModule,
  createFrontendPlugin,
  PageBlueprint,
} from '@backstage/frontend-plugin-api';
import { AddonBlueprint } from '@backstage/plugin-techdocs-react/alpha';
import EditIcon from '@material-ui/icons/Edit';
import { EditPageAddon } from './EditPageAddon';
import { rootRouteRef } from './routes';

/**
 * Editor visual de docs para o novo sistema de frontend (`app.packages: all` encontra sozinho).
 * A página fica em /docs-editor, com o título "Docs editor"; para mudar:
 * `app.extensions: [{ 'page:techdocs-editor': { config: { path, title } } }]`.
 *
 * @alpha
 */
export default createFrontendPlugin({
  pluginId: 'techdocs-editor',
  routes: { root: convertLegacyRouteRef(rootRouteRef) },
  extensions: [
    PageBlueprint.make({
      params: {
        path: '/docs-editor',
        routeRef: convertLegacyRouteRef(rootRouteRef),
        // Faixa do plugin do próprio Backstage (como "Catalog"); a página desenha só o título. Em
        // inglês, como os outros textos padrão: o app troca por `config.title`
        title: 'Docs editor',
        icon: <EditIcon fontSize="inherit" />,
        loader: () => import('./EditorPage').then(m => <m.EditorPage />),
      },
    }),
  ],
});

/**
 * Lápis "Editar" e datas da página no leitor do TechDocs. É um módulo do plugin `techdocs` (o addon
 * entra no leitor dele); instale junto com o plugin.
 *
 * @alpha
 */
export const techdocsEditorTechDocsModule = createFrontendModule({
  pluginId: 'techdocs',
  extensions: [
    AddonBlueprint.make({
      name: 'edit-page',
      params: {
        name: 'EditPage',
        location: 'Subheader',
        component: EditPageAddon,
      },
    }),
  ],
});

/** Textos do editor (inglês padrão, pt-BR incluído): para trocar textos ou acrescentar idiomas. */
export { techdocsEditorTranslationRef } from './translation';
