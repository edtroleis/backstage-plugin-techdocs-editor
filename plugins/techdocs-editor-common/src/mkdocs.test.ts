import {
  defaultCodeLanguage,
  docsDirFromMkdocs,
  fromEditor,
  pageFileCandidates,
  relativePath,
  repoLineNumbers,
  resolvePath,
  toEditor,
} from './mkdocs';

describe('toEditor / fromEditor (blocos do MkDocs)', () => {
  it.each([
    ['admonition', '!!! tip "Dica"\n    Corpo.\n\n    Mais corpo.\n'],
    ['details fechado', '??? note "Saiba mais"\n    Escondido.\n'],
    ['details aberto', '???+ warning\n    Aberto.\n'],
    ['abas', '=== "Linux"\n\n    Use bash.\n\n=== "Windows"\n\n    Use PowerShell.\n'],
    ['admonition com código dentro', '!!! example\n    ```bash\n    echo oi\n    ```\n'],
  ])('%s vira bloco protegido e volta igual', (_name, block) => {
    const markdown = `# Título\n\n${block}\nDepois.\n`;
    const editor = toEditor(markdown);
    expect(editor).toMatch(/^`{3,}mkdocs$/m);
    expect(fromEditor(editor)).toBe(markdown);
  });

  it('cerca maior que as crases do conteúdo', () => {
    const editor = toEditor('!!! example\n    ```bash\n    echo\n    ```\n');
    expect(editor.split('\n')[0]).toBe('````mkdocs');
  });

  it('texto comum passa sem mudança', () => {
    expect(toEditor('# Título\n\nTexto com !!! no meio.\n')).toBe('# Título\n\nTexto com !!! no meio.\n');
  });
});

describe('fromEditor (ajustes ao salvar)', () => {
  it('bloco de código sem linguagem ganha text', () => {
    expect(fromEditor('```\ncódigo\n```')).toBe('```text\ncódigo\n```\n');
  });

  it('não mexe em blocos com linguagem nem no conteúdo dos blocos', () => {
    const markdown = '```bash\n<br />\n\n\nfim   \n```\n';
    expect(fromEditor(markdown)).toBe(markdown);
  });

  it('tira linhas <br /> (Enter em linha vazia)', () => {
    expect(fromEditor('Um.\n\n<br />\n\nDois.\n')).toBe('Um.\n\nDois.\n');
  });

  it('tira imagem sem endereço (bloco de imagem deixado vazio)', () => {
    expect(fromEditor('Um.\n\n![1.00]()\n')).toBe('Um.\n');
  });

  it('mantém imagem com endereço', () => {
    expect(fromEditor('![foto](assets/a.png)\n')).toBe('![foto](assets/a.png)\n');
  });

  it('tira espaços no fim das linhas (MD009)', () => {
    expect(fromEditor('Texto com espaço \n\n- item\t\n')).toBe('Texto com espaço\n\n- item\n');
  });

  it('marcadores de lista do editor para listas seguidas viram - e 1. (MD004)', () => {
    expect(fromEditor('- a\n\n* b\n  * c\n\n> * d\n\n1. x\n\n1) y\n')).toBe(
      '- a\n\n- b\n  - c\n\n> - d\n\n1. x\n\n1. y\n',
    );
  });

  it('não mexe em * que não é marcador de lista', () => {
    const markdown = '* item com *ênfase*\n\n*ênfase* no início\n\n* * *\n';
    expect(fromEditor(markdown)).toBe('- item com *ênfase*\n\n*ênfase* no início\n\n* * *\n');
  });

  it('listas numeradas seguidas: numeração em sequência (MD029)', () => {
    expect(fromEditor('1. a\n2. b\n\n1) c\n2) d\n')).toBe('1. a\n2. b\n\n3. c\n4. d\n');
  });

  it('numeração: estilo "repete o número" mantido em sublistas e listas separadas', () => {
    const markdown = [
      '1. a',
      '   1. a1',
      '   1. a2',
      '   continuação do a',
      '1. b',
      '',
      '## Outra seção',
      '',
      '1. x',
      '1. y',
      '',
      '- marcador',
      '',
      '3. começa no 3',
      '3. segue',
      '',
    ].join('\n');
    expect(fromEditor(markdown)).toBe(
      [
        '1. a',
        '   1. a1',
        '   1. a2',
        '   continuação do a',
        '1. b',
        '',
        '## Outra seção',
        '',
        '1. x',
        '1. y',
        '',
        '- marcador',
        '',
        '3. começa no 3',
        '3. segue',
        '',
      ].join('\n'),
    );
  });

  it('lista só com "1." continua assim (estilo válido)', () => {
    expect(fromEditor('1. a\n1. b\n1. c\n')).toBe('1. a\n1. b\n1. c\n');
  });

  it('numeração não mexe em código', () => {
    const markdown = '```text\n1. a\n1. b\n```\n';
    expect(fromEditor(markdown)).toBe(markdown);
  });

  it('várias linhas em branco viram uma', () => {
    expect(fromEditor('Um.\n\n\n\nDois.\n')).toBe('Um.\n\nDois.\n');
  });

  it('termina com uma quebra de linha', () => {
    expect(fromEditor('Texto')).toBe('Texto\n');
  });

  it('mantém o conteúdo cru dos blocos do MkDocs, inclusive espaços', () => {
    const markdown = '!!! tip\n    Linha com espaço no fim  \n';
    expect(fromEditor(toEditor(markdown))).toBe(markdown);
  });
});

describe('defaultCodeLanguage', () => {
  it('só cercas de abertura sem linguagem', () => {
    expect(defaultCodeLanguage('```\na\n```\n\n~~~py\nb\n~~~')).toBe('```text\na\n```\n\n~~~py\nb\n~~~');
  });
});

describe('repoLineNumbers', () => {
  it('blocos do MkDocs: as cercas não contam como linhas do arquivo', () => {
    const editor = toEditor('# T\n\n!!! tip\n    Corpo.\n\nFim.\n');
    // # T | vazio | ```mkdocs | !!! tip | Corpo. | ``` | vazio | Fim.
    expect(repoLineNumbers(editor, { saved: false })).toEqual([1, 2, 3, 3, 4, 5, 5, 6, 7]);
  });

  it('saved: linhas que o tidy remove apontam para a próxima', () => {
    expect(repoLineNumbers('Um.\n\n<br />\n\nDois.', { saved: true })).toEqual([1, 2, 3, 3, 3]);
  });
});

describe('caminhos', () => {
  it('relativePath', () => {
    expect(relativePath('docs/guias', 'docs/assets/a.png')).toBe('../assets/a.png');
    expect(relativePath('docs', 'docs/assets/a.png')).toBe('assets/a.png');
  });

  it('resolvePath', () => {
    expect(resolvePath('docs/guias', '../assets/a.png')).toBe('docs/assets/a.png');
    expect(resolvePath('docs', './a/b.png')).toBe('docs/a/b.png');
  });

  it('pageFileCandidates na ordem do MkDocs', () => {
    expect(pageFileCandidates('docs', '')).toEqual(['docs/index.md', 'docs/README.md']);
    expect(pageFileCandidates('docs/', '/guias/x/')).toEqual([
      'docs/guias/x.md',
      'docs/guias/x/index.md',
      'docs/guias/x/README.md',
    ]);
  });

  it('docsDirFromMkdocs', () => {
    expect(docsDirFromMkdocs(undefined)).toBe('docs');
    expect(docsDirFromMkdocs('site_name: X\ndocs_dir: "conteudo" # pasta\n')).toBe('conteudo');
  });
});
