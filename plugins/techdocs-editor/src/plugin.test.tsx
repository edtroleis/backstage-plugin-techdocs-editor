import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { renderInTestApp, TestApiProvider } from '@backstage/test-utils';
import { catalogApiRef } from '@backstage/plugin-catalog-react';
import { TechDocsEditorPage } from './plugin';

// O editor (Milkdown/CodeMirror) só roda em navegador de verdade (testes do e2e/); aqui o que importa
// é a ligação da página com o app
jest.mock('./MarkdownEditor', () => ({ MarkdownEditor: () => null }));
jest.mock('./MarkdownSource', () => ({ MarkdownSource: () => null }));

/** Sistema de frontend antigo: a página montada por createRoutableExtension, numa rota escolhida pelo app. */
describe('TechDocsEditorPage (sistema de frontend antigo)', () => {
  it('lista as documentações e o link usa o caminho onde a página foi montada', async () => {
    const catalogApi = {
      getEntities: jest.fn().mockResolvedValue({
        items: [{ kind: 'Component', metadata: { namespace: 'default', name: 'wiki-time', title: 'Wiki do time' } }],
      }),
    };
    await renderInTestApp(
      <TestApiProvider apis={[[catalogApiRef, catalogApi]]}>
        <Routes>
          <Route path="/editar-docs" element={<TechDocsEditorPage />} />
        </Routes>
      </TestApiProvider>,
      { routeEntries: ['/editar-docs'] },
    );
    const link = await screen.findByRole('link', { name: /Wiki do time/ });
    expect(link.getAttribute('href')).toBe('/editar-docs?entity=component%3Adefault%2Fwiki-time&page=');
    expect(catalogApi.getEntities).toHaveBeenCalledWith(
      expect.objectContaining({ filter: expect.objectContaining({ 'metadata.annotations.backstage.io/techdocs-ref': expect.anything() }) }),
    );
  });
});
