/**
 * Ponte entre o Markdown do MkDocs e o editor visual.
 *
 * O editor entende CommonMark + GFM. Sintaxe própria do MkDocs, como admonitions
 * (`!!! tip "Dica"` com corpo indentado) e abas (`=== "Aba"`), seria achatada num parágrafo
 * comum e quebraria a página.
 * Por isso esses blocos entram no editor como bloco de código com a linguagem `mkdocs`
 * (editável como texto cru) e voltam ao formato original ao salvar.
 */

const RAW_LANG = 'mkdocs';

/**
 * Estilo do Markdown gerado pelo editor, o que as docs já usam: `-` em listas e `---` na linha
 * horizontal. O padrão do editor (`*` e `***`) mudaria o arquivo todo e geraria diffs enormes nos
 * PRs, e o lint reprova estilos misturados na mesma página (MD004, MD035).
 */
export const STRINGIFY_OPTIONS = { bullet: '-', rule: '-' } as const;

// Abertura de admonition/details ("!!! tipo", "??? tipo", "???+ tipo") ou de aba ('=== "Título"')
const BLOCK_START = /^(!!!|\?\?\?\+?|===\+?)\s+\S/;

/** Markdown do repositório → Markdown para o editor. */
export function toEditor(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    if (!BLOCK_START.test(lines[i])) {
      out.push(lines[i++]);
      continue;
    }
    const block = [lines[i++]];
    // Corpo: linhas indentadas (ou em branco seguidas de mais corpo indentado)
    while (i < lines.length) {
      if (/^( {4}|\t)/.test(lines[i])) {
        block.push(lines[i++]);
      } else if (lines[i].trim() === '' && i + 1 < lines.length && /^( {4}|\t)/.test(lines[i + 1])) {
        block.push(lines[i++]);
      } else {
        break;
      }
    }
    // A cerca precisa ser maior que qualquer sequência de crases do bloco (ex.: código dentro do admonition)
    const longest = Math.max(2, ...block.map(l => Math.max(0, ...(l.match(/`+/g) ?? []).map(m => m.length))));
    const fence = '`'.repeat(longest + 1);
    out.push(fence + RAW_LANG, ...block, fence);
  }
  // Blocos sem linguagem já aparecem como `text` no editor (o mesmo que será salvo)
  return defaultCodeLanguage(out.join('\n'));
}

/** Linguagem dada a blocos de código sem linguagem (o markdownlint exige uma: MD040). */
export const DEFAULT_CODE_LANG = 'text';

type LineContext = {
  /** Linha que abre um bloco de código, e o que vem depois da cerca (linguagem). */
  opensCode?: { info: string };
  /** Linha dentro de um bloco de código (inclui a cerca de fechamento). */
  inCode: boolean;
  /** Última linha já emitida. */
  previous?: string;
};

/** Linha de texto e o índice (0-based) da linha de origem no Markdown do editor. */
type Line = { text: string; origin: number };

const toLines = (markdown: string): Line[] => markdown.split('\n').map((text, origin) => ({ text, origin }));
const joinLines = (lines: Line[]) => lines.map(l => l.text).join('\n');

/** Reescreve as linhas sabendo quais estão em blocos de código; `null` remove a linha. */
function mapLines(lines: Line[], fn: (line: string, ctx: LineContext) => string | null): Line[] {
  const out: Line[] = [];
  let fence: string | undefined;
  for (const { text: line, origin } of lines) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    let ctx: LineContext;
    if (fence) {
      ctx = { inCode: true };
      if (marker && marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) {
        fence = undefined;
      }
    } else if (marker) {
      fence = marker[1];
      ctx = { inCode: false, opensCode: { info: marker[2].trim() } };
    } else {
      ctx = { inCode: false };
    }
    const mapped = fn(line, { ...ctx, previous: out[out.length - 1]?.text });
    if (mapped !== null) out.push({ text: mapped, origin });
  }
  return out;
}

const withDefaultCodeLanguage = (lines: Line[]) =>
  mapLines(lines, (line, { opensCode }) =>
    opensCode && !opensCode.info ? `${line}${DEFAULT_CODE_LANG}` : line,
  );

/** Bloco de código sem linguagem ganha `text`. */
export function defaultCodeLanguage(markdown: string) {
  return joinLines(withDefaultCodeLanguage(toLines(markdown)));
}

/**
 * Ajustes no Markdown que o editor gera, fora dos blocos de código:
 * - bloco de código sem linguagem ganha `text`;
 * - linhas só com `<br />` (Enter em linha vazia) saem;
 * - imagens sem endereço (bloco de imagem deixado vazio) saem;
 * - espaços no fim da linha saem (o lint reprova, MD009; quebra de linha do editor sai como `\`);
 * - marcador de lista sempre `-` e `1.`: com duas listas seguidas, o editor usa `*` e `1)` na
 *   segunda para não juntá-las, e o lint reprova estilos misturados (MD004). As listas se juntam;
 * - mais de uma linha em branco seguida vira uma.
 */
const tidy = (lines: Line[]) =>
  mapLines(withDefaultCodeLanguage(lines), (original, { inCode, opensCode, previous }) => {
    if (inCode || opensCode) return original;
    let line = original.replace(/[ \t]+$/, '');
    // "* * *" é linha horizontal, não lista
    if (!/^\s*(\*\s*){3,}$/.test(line)) {
      line = line.replace(/^(\s*(?:>\s*)*)\*(\s+)(?=\S)/, '$1-$2').replace(/^(\s*(?:>\s*)*\d+)\)(\s)/, '$1.$2');
    }
    if (line.trim() === '<br />') return null;
    // Bloco de imagem inserido e deixado sem imagem
    if (/^!\[[^\]]*\]\(\s*\)$/.test(line.trim())) return null;
    if (line.trim() === '' && previous !== undefined && previous.trim() === '') return null;
    return line;
  });

/**
 * Numera em sequência os itens de cada lista numerada. Duas listas numeradas seguidas no editor
 * viram uma só no arquivo (ver tidy), e a numeração recomeçava no meio (1, 2, 1, 2): o lint reprova
 * (MD029). Cada lista continua a partir do primeiro número dela; lista escrita só com "1." (o
 * segundo item repete o número do primeiro) continua assim, que também é válido.
 */
const renumberOrderedLists = (lines: Line[]) => {
  // Listas abertas, da mais externa para a mais interna: recuo e próximo número
  const open: Array<{ indent: number; first: number; next: number; same?: boolean }> = [];
  return mapLines(lines, (line, { inCode, opensCode }) => {
    if (inCode || opensCode || line.trim() === '') return line;
    const item = line.match(/^(\s*)(\d+)\.(\s.*)$/);
    const indent = (item ? item[1] : line.match(/^\s*/)![0]).length;
    // Uma linha com recuo menor ou igual ao de uma lista termina essa lista (a não ser o próprio item)
    while (open.length && (open[open.length - 1].indent > indent || (!item && open[open.length - 1].indent >= indent))) {
      open.pop();
    }
    if (!item) return line;
    const current = open[open.length - 1];
    if (current?.indent === indent) {
      // O segundo item define o estilo: repetir o número ou contar
      current.same ??= Number(item[2]) === current.first;
      const number = current.same ? current.first : current.next++;
      return `${item[1]}${number}.${item[3]}`;
    }
    open.push({ indent, first: Number(item[2]), next: Number(item[2]) + 1 });
    return line;
  });
};

/** Tira as cercas `mkdocs` que protegiam admonitions/abas no editor, devolvendo o texto original. */
function restoreRawBlocks(lines: Line[]): Line[] {
  const out: Line[] = [];
  for (let i = 0; i < lines.length; i++) {
    const open = lines[i].text.match(new RegExp(`^(\`{3,})${RAW_LANG}$`));
    const close = open && lines.findIndex((l, j) => j > i && l.text === open[1]);
    if (open && close && close > 0) {
      out.push(...lines.slice(i + 1, close));
      i = close;
    } else {
      out.push(lines[i]);
    }
  }
  return out;
}

// tidy antes de restaurar: os blocos do MkDocs ainda estão protegidos dentro de cercas
const toRepoLines = (markdown: string) => restoreRawBlocks(renumberOrderedLists(tidy(toLines(markdown))));

/** Markdown do editor → Markdown do repositório. */
export function fromEditor(markdown: string): string {
  const restored = joinLines(toRepoLines(markdown));
  return restored.endsWith('\n') ? restored : `${restored}\n`;
}

/**
 * Para cada linha do Markdown do editor (índice 0-based), a linha (1-based) correspondente no
 * arquivo. Linhas que não existem no arquivo apontam para a próxima que existe.
 * `saved: true` conta como o arquivo vai ficar ao salvar (com os ajustes); `false`, como está no
 * último commit (as linhas que a pipeline aponta).
 */
export function repoLineNumbers(markdown: string, { saved }: { saved: boolean }): number[] {
  const total = markdown.split('\n').length;
  const map = new Array<number>(total);
  const lines = saved ? toRepoLines(markdown) : restoreRawBlocks(toLines(markdown));
  lines.forEach((line, index) => {
    map[line.origin] = index + 1;
  });
  let next = map.filter(Boolean).length + 1;
  for (let i = total - 1; i >= 0; i--) {
    if (map[i] === undefined) map[i] = next;
    else next = map[i];
  }
  return map;
}

/** Caminho relativo de `to` a partir da pasta `fromDir` (ambos relativos à raiz do repositório). */
export function relativePath(fromDir: string, to: string): string {
  const from = fromDir.split('/').filter(Boolean);
  const target = to.split('/').filter(Boolean);
  let common = 0;
  while (common < from.length && common < target.length - 1 && from[common] === target[common]) common++;
  return [...from.slice(common).map(() => '..'), ...target.slice(common)].join('/');
}

/** Resolve um caminho relativo (ex.: "../assets/x.png") a partir da pasta `dir`. */
export function resolvePath(dir: string, relative: string): string {
  const parts = dir.split('/').filter(Boolean);
  for (const part of relative.split('/')) {
    if (part === '..') parts.pop();
    else if (part && part !== '.') parts.push(part);
  }
  return parts.join('/');
}

export const dirOf = (path: string) => path.split('/').slice(0, -1).join('/');

/**
 * Candidatos de arquivo para uma página do TechDocs, na ordem em que o MkDocs resolve.
 * `docsDir` é a pasta das docs no repositório (ex.: "docs"); `page` é o caminho da página
 * na URL do TechDocs (ex.: "guias/primeiros-passos").
 */
export function pageFileCandidates(docsDir: string, page: string): string[] {
  const clean = page.replace(/^\/+|\/+$/g, '');
  const base = docsDir.replace(/\/+$/, '');
  if (!clean) return [`${base}/index.md`, `${base}/README.md`];
  return [`${base}/${clean}.md`, `${base}/${clean}/index.md`, `${base}/${clean}/README.md`];
}

/** Lê `docs_dir` do mkdocs.yml (padrão do MkDocs: "docs"). */
export function docsDirFromMkdocs(mkdocsYml: string | undefined): string {
  const match = mkdocsYml?.match(/^docs_dir:\s*['"]?([^'"\n#]+?)['"]?\s*(#.*)?$/m);
  return match ? match[1] : 'docs';
}
