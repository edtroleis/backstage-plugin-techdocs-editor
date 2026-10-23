import type { Annotation, CheckRun } from './github';

/**
 * Mensagem em linguagem simples para um check que falhou: a configurada para o nome do job
 * (`techdocsEditor.verification.checkHelp`, porque cada pipeline tem os seus jobs). Sem ela, undefined
 * (o frontend mostra a mensagem padrão, traduzida).
 */
export const failureHelp = (name: string, help: Record<string, string> = {}): string | undefined => help[name];

/**
 * Só os apontamentos sobre os arquivos de docs; descarta avisos da própria execução
 * (ex.: "Node.js 20 is deprecated", "Failed with exit code 1").
 */
export const relevantAnnotations = (annotations: Annotation[]) =>
  annotations.filter(a => a.level === 'failure' && !a.path.startsWith('.github'));

/**
 * Apontamento da pipeline: a regra do markdownlint, se for uma ("docs/index.md:32 MD040/fenced-code-language
 * Fenced…" → "MD040"), e o texto sem o prefixo arquivo:linha. O frontend traduz a regra.
 */
export function parseAnnotation(a: Annotation): { rule?: string; description: string } {
  return {
    rule: a.message.match(/\b(MD\d{3})\//)?.[1],
    description: a.message.replace(/^\S+:\d+(:\d+)?\s+/, ''),
  };
}

/**
 * Trecho visível no editor perto da linha `line` do arquivo: a própria linha ou, se ela não tiver
 * texto (ex.: a cerca ``` de um bloco de código), uma das seguintes. Sem marcação de Markdown, e só
 * até a primeira formatação, para bater com um único trecho de texto do editor.
 */
export function snippetAt(content: string, line: number): string | undefined {
  const lines = content.split('\n');
  for (let i = line - 1; i < Math.min(lines.length, line + 3); i++) {
    const plain = (lines[i] ?? '')
      .replace(/^\s*(#{1,6}\s+|[-*+]\s+(\[[ x]\]\s+)?|\d+\.\s+|>\s*|`{3,}.*|~{3,}.*|\|)/, '')
      .split(/[*_`[\]|<]/)[0]
      .trim();
    if (/[\p{L}\p{N}]{2,}/u.test(plain)) return plain.slice(0, 40);
  }
  return undefined;
}

const FAILED_CONCLUSIONS = ['failure', 'timed_out', 'cancelled', 'action_required'];

export const isFailed = (run: CheckRun) =>
  run.status === 'completed' && FAILED_CONCLUSIONS.includes(run.conclusion ?? '');

export type ChecksSummary = 'none' | 'running' | 'failed' | 'passed';

export function summarize(runs: CheckRun[]): ChecksSummary {
  if (!runs.length) return 'none';
  if (runs.some(r => r.status !== 'completed')) return 'running';
  if (runs.some(isFailed)) return 'failed';
  return 'passed';
}
