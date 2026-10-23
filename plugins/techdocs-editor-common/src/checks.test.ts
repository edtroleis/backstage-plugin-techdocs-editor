import { failureHelp, isFailed, parseAnnotation, relevantAnnotations, snippetAt, summarize } from './checks';
import type { Annotation, CheckRun } from './github';

const annotation = (a: Partial<Annotation>): Annotation =>
  ({ path: 'docs/index.md', line: 1, level: 'failure', message: '', ...a }) as Annotation;
const run = (r: Partial<CheckRun>): CheckRun =>
  ({ id: 1, name: 'Links', status: 'completed', conclusion: 'success', htmlUrl: '', ...r }) as CheckRun;

describe('parseAnnotation', () => {
  it('regra do markdownlint e o texto sem o prefixo arquivo:linha', () => {
    expect(parseAnnotation(annotation({ message: 'docs/index.md:32 MD040/fenced-code-language Fenced…' }))).toEqual({
      rule: 'MD040',
      description: 'MD040/fenced-code-language Fenced…',
    });
  });

  it('mensagem de outra ferramenta: sem regra', () => {
    expect(parseAnnotation(annotation({ message: 'docs/a.md:3:5 Link quebrado' }))).toEqual({
      rule: undefined,
      description: 'Link quebrado',
    });
  });
});

it('relevantAnnotations descarta avisos da própria execução', () => {
  const found = relevantAnnotations([
    annotation({ message: 'erro' }),
    annotation({ level: 'warning' as Annotation['level'] }),
    annotation({ path: '.github', message: 'Node.js 20 is deprecated' }),
  ]);
  expect(found).toHaveLength(1);
});

describe('snippetAt', () => {
  const content = '# Título\n\n```bash\necho oi\n```\n\n- item **forte** fim\n';
  it('tira a marcação e para na primeira formatação', () => {
    expect(snippetAt(content, 7)).toBe('item');
    expect(snippetAt(content, 1)).toBe('Título');
  });
  it('linha sem texto (cerca) usa uma das seguintes', () => {
    expect(snippetAt(content, 3)).toBe('echo oi');
  });
});

describe('summarize', () => {
  it('estados', () => {
    expect(summarize([])).toBe('none');
    expect(summarize([run({ status: 'in_progress', conclusion: null })])).toBe('running');
    expect(summarize([run({}), run({ conclusion: 'failure' })])).toBe('failed');
    expect(summarize([run({})])).toBe('passed');
  });
  it('isFailed', () => {
    expect(isFailed(run({ conclusion: 'timed_out' }))).toBe(true);
    expect(isFailed(run({ conclusion: 'skipped' }))).toBe(false);
  });
});

describe('failureHelp', () => {
  it('usa a mensagem configurada para o nome do check; sem ela, undefined (o frontend usa a padrão)', () => {
    const help = { Links: 'Há links que não funcionam.' };
    expect(failureHelp('Links', help)).toBe('Há links que não funcionam.');
    expect(failureHelp('Outro job', help)).toBeUndefined();
    expect(failureHelp('Links')).toBeUndefined();
  });
});
