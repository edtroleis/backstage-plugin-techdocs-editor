import { DEFAULT_LINT_CONFIG, fixLintProblems, lintFindings, lintMarkdown, parseLintConfig } from './lint';

// Mesma configuração da wiki de exemplo (techdocs-editor/e2e/portal/wiki-fixture/.markdownlint.yaml)
const WIKI_CONFIG = parseLintConfig(
  '.markdownlint.yaml',
  '# Regras ajustadas\ndefault: true\nMD013: false   # tamanho de linha\nMD033: false\nMD046: false\n',
);

describe('parseLintConfig', () => {
  it('lê YAML com comentários', () => {
    expect(WIKI_CONFIG).toEqual({ default: true, MD013: false, MD033: false, MD046: false });
  });

  it('lê JSON com comentários (jsonc), sem estragar strings com //', () => {
    const config = parseLintConfig(
      '.markdownlint.jsonc',
      '{\n  // regras\n  "default": true, /* bloco */\n  "MD044": { "names": ["https://x.com"] }\n}',
    );
    expect(config).toEqual({ default: true, MD044: { names: ['https://x.com'] } });
  });
});

describe('lintMarkdown', () => {
  it('página correta não tem problemas', () => {
    const page = '# Título\n\nTexto.\n\n- um\n- dois\n\n```bash\necho\n```\n';
    expect(lintMarkdown(page, WIKI_CONFIG)).toEqual([]);
  });

  it('aponta linha e regra, em ordem de linha', () => {
    const page = '# Título\nTexto\n\n```\nx\n```\n';
    expect(lintMarkdown(page, WIKI_CONFIG).map(p => [p.line, p.rule])).toEqual([
      [1, 'MD022'],
      [4, 'MD040'],
    ]);
  });

  it('respeita a configuração (linha longa liberada na wiki)', () => {
    const page = `# Título\n\n${'palavra '.repeat(30).trim()}\n`;
    expect(lintMarkdown(page, DEFAULT_LINT_CONFIG).map(p => p.rule)).toContain('MD013');
    expect(lintMarkdown(page, WIKI_CONFIG)).toEqual([]);
  });
});

describe('lintFindings', () => {
  it('regra, descrição do markdownlint e trecho de texto da linha', () => {
    const [finding] = lintFindings('# Título\n\nTexto com espaço   \n', WIKI_CONFIG);
    expect(finding).toMatchObject({ line: 3, rule: 'MD009', snippet: 'Texto com espaço' });
    expect(finding.message).toMatch(/trailing spaces/i);
  });

  it('a descrição vale para qualquer regra', () => {
    const [finding] = lintFindings('# A\n\n# B\n', { default: false, MD025: false, MD024: false, MD043: { headings: ['# A'] } });
    expect(finding.rule).toBe('MD043');
    expect(finding.message).toMatch(/heading/i);
  });
});

describe('fixLintProblems', () => {
  // A página do print: a wiki com uma seção nova criada como Título 1
  const WIKI_INDEX = [
    '# Wiki de Demonstração',
    '',
    'Bem-vindo!',
    '',
    '## Como editar',
    '',
    '1. Abra a página.',
    '',
    '# Exemplo de imagem',
    '',
    '![1.00](../assets/foto.png)',
    '',
  ].join('\n');

  it('Título 1 a mais vira Título 2 e o problema some', () => {
    expect(lintMarkdown(WIKI_INDEX, WIKI_CONFIG)).toEqual([
      expect.objectContaining({ line: 9, rule: 'MD025', fixable: true }),
    ]);
    const fixed = fixLintProblems(WIKI_INDEX, WIKI_CONFIG);
    expect(fixed).toBe(WIKI_INDEX.replace('# Exemplo de imagem', '## Exemplo de imagem'));
    expect(lintMarkdown(fixed, WIKI_CONFIG)).toEqual([]);
  });

  it('título que pula nível vai para o nível esperado, em cascata', () => {
    const page = '# T\n\n### Seção\n\n##### Sub\n';
    expect(lintMarkdown(page, WIKI_CONFIG).every(p => p.fixable)).toBe(true);
    expect(fixLintProblems(page, WIKI_CONFIG)).toBe('# T\n\n## Seção\n\n### Sub\n');
  });

  it('o primeiro Título 1, mesmo com texto repetido, fica', () => {
    const fixed = fixLintProblems('# Igual\n\nx\n\n# Igual\n', WIKI_CONFIG);
    expect(fixed).toBe('# Igual\n\nx\n\n## Igual\n');
  });

  it('aplica as correções do próprio markdownlint (linhas em branco, espaços)', () => {
    const page = '# T\nTexto   \n- item\n\n\n```bash\nx\n```\nfim';
    const fixed = fixLintProblems(page, WIKI_CONFIG);
    expect(lintMarkdown(fixed, WIKI_CONFIG)).toEqual([]);
    expect(fixed).toBe('# T\n\nTexto\n\n- item\n\n```bash\nx\n```\n\nfim\n');
  });

  it('o que não tem correção automática continua apontado', () => {
    const page = '# T\n\n```\nx\n```\n';
    const [problem] = lintMarkdown(page, WIKI_CONFIG);
    expect(problem).toMatchObject({ rule: 'MD040', fixable: false });
    expect(fixLintProblems(page, WIKI_CONFIG)).toBe(page);
  });
});
