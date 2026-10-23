import { createRouteRef } from '@backstage/core-plugin-api';

/**
 * Página do editor. Quem instala escolhe o caminho (o padrão do novo sistema de frontend é
 * /docs-editor); o addon do TechDocs monta o link com ?entity=<ref>&page=<caminho da página>.
 */
export const rootRouteRef = createRouteRef({ id: 'techdocs-editor' });
