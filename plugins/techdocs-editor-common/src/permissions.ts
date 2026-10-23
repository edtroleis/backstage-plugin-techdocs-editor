import { RESOURCE_TYPE_CATALOG_ENTITY } from '@backstage/plugin-catalog-common/alpha';
import { createPermission } from '@backstage/plugin-permission-common';

/**
 * Editar as páginas de uma documentação pelo editor visual. Decide se o lápis aparece e se o editor
 * abre; a escrita em si continua sendo decidida pelo GitHub (os dois precisam permitir).
 *
 * É uma permissão de recurso sobre a entidade do catálogo: uma política pode usar as regras do
 * catálogo, como "é owner da entidade" (`catalogConditions.isEntityOwner`).
 *
 * @public
 */
export const techdocsEditorEditPermission = createPermission({
  name: 'techdocs-editor.page.edit',
  attributes: { action: 'update' },
  resourceType: RESOURCE_TYPE_CATALOG_ENTITY,
});

/** @public */
export const techdocsEditorPermissions = [techdocsEditorEditPermission];
