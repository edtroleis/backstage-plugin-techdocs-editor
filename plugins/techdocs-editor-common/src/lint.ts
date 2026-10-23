import { applyFixes, lint } from './vendor/markdownlint';
import type { Configuration, LintError } from 'markdownlint';
import { parse as parseYaml } from 'yaml';
import { snippetAt } from './checks';

/**
 * Lint do Markdown no próprio editor, antes de salvar: o mesmo markdownlint (0.37.4) da pipeline
 * (markdownlint-cli2-action@v19, check "Formatação do texto") e a mesma configuração do
 * repositório. Assim o erro aparece na hora, sem esperar a pipeline.
 */

/** Arquivos de configuração que o markdownlint-cli2 lê da raiz do repositório, nesta ordem. */
export const LINT_CONFIG_FILES = [
  '.markdownlint.jsonc',
  '.markdownlint.json',
  '.markdownlint.yaml',
  '.markdownlint.yml',
];

/** Sem arquivo de configuração, o markdownlint usa todas as regras. */
export const DEFAULT_LINT_CONFIG: Configuration = { default: true };

/** Conteúdo do arquivo de configuração → configuração (JSON com comentários ou YAML). */
export function parseLintConfig(fileName: string, text: string): Configuration {
  if (/\.ya?ml$/.test(fileName)) return (parseYaml(text) as Configuration) ?? DEFAULT_LINT_CONFIG;
  // jsonc: tira comentários de linha e de bloco fora das strings
  const json = text.replace(/("(?:\\.|[^"\\])*")|\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (_m, str) => str ?? '');
  return JSON.parse(json) as Configuration;
}

export type LintProblem = {
  line: number;
  /** Código da regra (ex.: MD040). */
  rule: string;
  /** Descrição em inglês do markdownlint, com o detalhe (usada quando não há texto em português). */
  description: string;
  /** O botão "Corrigir automaticamente" resolve este problema. */
  fixable: boolean;
};

const PAGE = 'page.md';

const lintErrors = (markdown: string, config: Configuration): LintError[] =>
  lint({ strings: { [PAGE]: markdown }, config })[PAGE];

/**
 * Correções do editor para regras que o markdownlint não corrige sozinho, só em títulos `#`:
 * - Título 1 a mais (MD025): o primeiro é o nome da página; os outros viram Título 2;
 * - título que pula nível (MD001, ex.: Título 3 logo depois do 1): vai para o nível esperado.
 * Devolve a linha corrigida, ou undefined se não houver correção.
 */
function customFix(e: LintError, line: string): string | undefined {
  if (!/^#{1,6}\s/.test(line)) return undefined;
  if (e.ruleNames[0] === 'MD025') return `#${line}`;
  const expected = e.ruleNames[0] === 'MD001' && e.errorDetail?.match(/Expected: h(\d)/);
  return expected ? line.replace(/^#+/, '#'.repeat(Number(expected[1]))) : undefined;
}

/** Problemas de formatação de `markdown` (como vai ser salvo no repositório). */
export function lintMarkdown(markdown: string, config: Configuration): LintProblem[] {
  const lines = markdown.split('\n');
  return lintErrors(markdown, config)
    .map(e => ({
      line: e.lineNumber,
      rule: e.ruleNames[0],
      description: [e.ruleDescription, e.errorDetail].filter(Boolean).join(': '),
      fixable: Boolean(e.fixInfo) || customFix(e, lines[e.lineNumber - 1] ?? '') !== undefined,
    }))
    .sort((a, b) => a.line - b.line);
}

/**
 * Aplica as correções automáticas (as do markdownlint e as do editor) e devolve o Markdown
 * corrigido. Repete algumas vezes: uma correção pode revelar outro problema corrigível.
 */
export function fixLintProblems(markdown: string, config: Configuration): string {
  let current = markdown;
  for (let round = 0; round < 8; round++) {
    const errors = lintErrors(current, config);
    const lines = current.split('\n');
    const titles = new Map<number, string>();
    for (const e of errors) {
      const fixed = customFix(e, lines[e.lineNumber - 1] ?? '');
      if (fixed !== undefined && !titles.has(e.lineNumber)) titles.set(e.lineNumber, fixed);
    }
    // Títulos primeiro (não mudam o número de linhas); as do markdownlint na rodada seguinte
    const next = titles.size
      ? lines.map((line, i) => titles.get(i + 1) ?? line).join('\n')
      : applyFixes(current, errors.filter(e => e.fixInfo));
    if (next === current) break;
    current = next;
  }
  return current;
}

/**
 * Problema com o trecho da linha, para achar no editor visual. `message` é a descrição do markdownlint
 * (em inglês): o frontend mostra o texto traduzido da regra e usa este só para regras sem tradução.
 */
export type LintFinding = LintProblem & { message: string; snippet?: string };

export function lintFindings(markdown: string, config: Configuration): LintFinding[] {
  return lintMarkdown(markdown, config).map(p => ({
    ...p,
    message: p.description,
    snippet: snippetAt(markdown, p.line),
  }));
}
