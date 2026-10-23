import { Entity } from '@backstage/catalog-model';
import { branchFor, DEFAULT_BRANCH_PATTERN, repoHost, repoSlug } from './session';

const entity = (annotations: Record<string, string>): Entity => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name: 'wiki', annotations },
});

describe('branchFor', () => {
  it('padrão: uma branch por pessoa e por arquivo', () => {
    expect(DEFAULT_BRANCH_PATTERN).toBe('docs/{login}/{path}');
    expect(branchFor('ana', 'docs/guias/primeiros passos.md')).toBe('docs/ana/docs-guias-primeiros-passos');
  });

  it('segue o padrão configurado', () => {
    expect(branchFor('ana', 'docs/index.md', 'rascunhos/{path}-{login}')).toBe('rascunhos/docs-index-ana');
  });
});

describe('repoSlug e repoHost', () => {
  it('github.com/project-slug tem prioridade', () => {
    const e = entity({
      'github.com/project-slug': 'time/wiki',
      'backstage.io/source-location': 'url:https://ghe.empresa.com/outro/repo/tree/main/',
    });
    expect(repoSlug(e)).toBe('time/wiki');
    expect(repoHost(e)).toBe('ghe.empresa.com');
  });

  it('sem project-slug, usa o source-location (inclusive GitHub Enterprise)', () => {
    const e = entity({ 'backstage.io/source-location': 'url:https://ghe.empresa.com/time/wiki.git' });
    expect(repoSlug(e)).toBe('time/wiki');
    expect(repoHost(e)).toBe('ghe.empresa.com');
  });

  it('sem nenhuma das anotações', () => {
    expect(repoSlug(entity({}))).toBeUndefined();
    expect(repoHost(entity({}))).toBeUndefined();
  });
});
