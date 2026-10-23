import { useEffect, useState } from 'react';
import { Content, Link, Progress, WarningPanel } from '@backstage/core-components';
import { CATALOG_FILTER_EXISTS } from '@backstage/catalog-client';
import { useApi, useRouteRef } from '@backstage/core-plugin-api';
import { Entity, stringifyEntityRef } from '@backstage/catalog-model';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { Header } from '@backstage/ui';
import { List, ListItem, ListItemIcon, ListItemText, Paper } from '@material-ui/core';
import DescriptionIcon from '@material-ui/icons/Description';
import { rootRouteRef } from './routes';
import { useEditorTranslation } from './useEditorTranslation';

/**
 * Página inicial do editor (/docs-editor sem ?entity): as documentações do catálogo, para escolher
 * qual editar. Antes, abrir o editor pelo menu ou pela faixa do plugin dava erro.
 */
export const DocsToEdit = () => {
  const catalogApi = useApi(catalogApiRef);
  const { t } = useEditorTranslation();
  const [value, setValue] = useState<Entity[]>();
  const [error, setError] = useState<Error>();
  const loading = !value && !error;

  useEffect(() => {
    catalogApi
      .getEntities({
        // Tudo o que tem TechDocs
        filter: { 'metadata.annotations.backstage.io/techdocs-ref': CATALOG_FILTER_EXISTS },
        fields: ['kind', 'metadata.namespace', 'metadata.name', 'metadata.title', 'metadata.description'],
      })
      .then(r => setValue(r.items), setError);
  }, [catalogApi]);

  const editorRoot = useRouteRef(rootRouteRef);
  const editLink = (entity: Entity) =>
    `${editorRoot()}?${new URLSearchParams({ entity: stringifyEntityRef(entity), page: '' })}`;

  return (
    <>
      <Header
        title={t('docsList.title')}
        description={t('docsList.description')}
      />
      <Content>
        {loading && <Progress />}
        {error && (
          <WarningPanel
            severity="error"
            title={t('docsList.loadError')}
            message={error.message}
            defaultExpanded
          />
        )}
        {value && value.length === 0 && (
          <WarningPanel severity="info" title={t('docsList.empty')} />
        )}
        {value && value.length > 0 && (
          <Paper>
            <List>
              {value.map(entity => (
                // É navegação: o ListItem "button" do MUI anunciaria botão para o leitor de tela
                <ListItem key={stringifyEntityRef(entity)} button component={Link} to={editLink(entity)} role="link">
                  <ListItemIcon>
                    <DescriptionIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={entity.metadata.title ?? entity.metadata.name}
                    secondary={entity.metadata.description}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}
      </Content>
    </>
  );
};
