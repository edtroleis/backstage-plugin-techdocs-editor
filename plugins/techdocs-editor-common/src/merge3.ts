/**
 * Fusão de 3 vias por linha, como a do Git: parte da versão comum (`base`) e junta as alterações da
 * pessoa (`mine`) e as publicadas na main (`theirs`). Alterações em trechos separados entram as duas;
 * no mesmo trecho (ou em linhas vizinhas, como no Git) viram um conflito para a pessoa escolher.
 */

export type MergeChunk =
  | { kind: 'same'; lines: string[] }
  | { kind: 'conflict'; mine: string[]; theirs: string[] };

/** Escolha da pessoa em cada conflito. */
export type ConflictChoice = 'mine' | 'theirs' | 'both';

type Side = 'mine' | 'theirs';
/** Troca as linhas base[start, end) por `lines`. */
type Hunk = { start: number; end: number; lines: string[]; side: Side };

/** Trechos alterados de `base` para `other` (diff por linha, pela maior subsequência comum). */
function diffHunks(base: string[], other: string[], side: Side): Hunk[] {
  const n = base.length;
  const m = other.length;
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = base[i] === other[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const hunks: Hunk[] = [];
  let current: Hunk | undefined;
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && base[i] === other[j]) {
      if (current) hunks.push(current);
      current = undefined;
      i++;
      j++;
    } else if (j < m && (i === n || lcs[i][j + 1] >= lcs[i + 1][j])) {
      current ??= { start: i, end: i, lines: [], side };
      current.lines.push(other[j++]);
    } else {
      current ??= { start: i, end: i, lines: [], side };
      current.end = ++i;
    }
  }
  if (current) hunks.push(current);
  return hunks;
}

/** O trecho base[start, end) com as alterações de um lado aplicadas. */
function render(base: string[], start: number, end: number, hunks: Hunk[]): string[] {
  const out: string[] = [];
  let pos = start;
  for (const h of hunks) {
    out.push(...base.slice(pos, h.start), ...h.lines);
    pos = h.end;
  }
  out.push(...base.slice(pos, end));
  return out;
}

const sameLines = (a: string[], b: string[]) => a.length === b.length && a.every((line, i) => line === b[i]);

export function merge3(baseText: string, mineText: string, theirsText: string): MergeChunk[] {
  const base = baseText.split('\n');
  const hunks = [
    ...diffHunks(base, mineText.split('\n'), 'mine'),
    ...diffHunks(base, theirsText.split('\n'), 'theirs'),
  ].sort((a, b) => a.start - b.start || a.end - b.end);

  const chunks: MergeChunk[] = [];
  const pushSame = (lines: string[]) => {
    if (!lines.length) return;
    const last = chunks[chunks.length - 1];
    if (last?.kind === 'same') last.lines.push(...lines);
    else chunks.push({ kind: 'same', lines: [...lines] });
  };

  let pos = 0;
  for (let k = 0; k < hunks.length; ) {
    // Agrupa alterações que se sobrepõem ou se encostam
    const { start } = hunks[k];
    let end = hunks[k].end;
    const group = [hunks[k++]];
    while (k < hunks.length && hunks[k].start <= end) {
      end = Math.max(end, hunks[k].end);
      group.push(hunks[k++]);
    }
    pushSame(base.slice(pos, start));
    const mine = group.filter(h => h.side === 'mine');
    const theirs = group.filter(h => h.side === 'theirs');
    const mineLines = render(base, start, end, mine);
    const theirsLines = render(base, start, end, theirs);
    if (!theirs.length || sameLines(mineLines, theirsLines)) pushSame(mineLines);
    else if (!mine.length) pushSame(theirsLines);
    else chunks.push({ kind: 'conflict', mine: mineLines, theirs: theirsLines });
    pos = end;
  }
  pushSame(base.slice(pos));
  return chunks;
}

export const conflictCount = (chunks: MergeChunk[]) => chunks.filter(c => c.kind === 'conflict').length;

/** Texto final com a escolha de cada conflito, na ordem em que aparecem. "As duas": a publicada e depois a sua. */
export function resolveChunks(chunks: MergeChunk[], choices: ConflictChoice[]): string {
  let n = 0;
  return chunks
    .flatMap(c => {
      if (c.kind === 'same') return c.lines;
      const choice = choices[n++];
      if (choice === 'mine') return c.mine;
      if (choice === 'theirs') return c.theirs;
      return [...c.theirs, ...c.mine];
    })
    .join('\n');
}
