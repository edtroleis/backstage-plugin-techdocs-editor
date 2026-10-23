import { $prose } from '@milkdown/kit/utils';
import { Plugin, PluginKey } from '@milkdown/kit/prose/state';
import type { EditorView } from '@milkdown/kit/prose/view';
import { Decoration, DecorationSet } from '@milkdown/kit/prose/view';
import type { Node } from '@milkdown/kit/prose/model';

type Match = { from: number; to: number };
type SearchState = { query: string; current: number; matches: Match[] };

const key = new PluginKey<SearchState>('docs-editor-search');

/** Ocorrências de `query` (sem diferenciar maiúsculas) nos trechos de texto do documento. */
function findMatches(doc: Node, query: string): Match[] {
  const matches: Match[] = [];
  if (!query) return matches;
  const needle = query.toLocaleLowerCase();
  doc.descendants((node, pos) => {
    if (!node.isText) return;
    const text = node.text!.toLocaleLowerCase();
    for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + needle.length)) {
      matches.push({ from: pos + i, to: pos + i + needle.length });
    }
  });
  return matches;
}

/** Plugin do editor visual: destaca os resultados da busca (o atual em destaque mais forte). */
export const visualSearchPlugin = $prose(
  () =>
    new Plugin<SearchState>({
      key,
      state: {
        init: () => ({ query: '', current: 0, matches: [] }),
        apply(tr, previous) {
          const meta = tr.getMeta(key) as Partial<SearchState> | undefined;
          if (!meta && !tr.docChanged) return previous;
          const query = meta?.query ?? previous.query;
          const matches = findMatches(tr.doc, query);
          const current = Math.min(meta?.current ?? previous.current, Math.max(0, matches.length - 1));
          return { query, current, matches };
        },
      },
      props: {
        decorations(state) {
          const { matches, current } = key.getState(state)!;
          return DecorationSet.create(
            state.doc,
            matches.map((m, i) =>
              Decoration.inline(m.from, m.to, {
                class: i === current ? 'docs-search-current' : 'docs-search-match',
              }),
            ),
          );
        },
      },
    }),
);

export type SearchResult = { current: number; total: number };

function scrollToCurrent(view: EditorView) {
  const { matches, current } = key.getState(view.state)!;
  const match = matches[current];
  if (!match) return;
  const { node } = view.domAtPos(match.from);
  const element = node instanceof HTMLElement ? node : node.parentElement;
  element?.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

const result = (view: EditorView): SearchResult => {
  const { matches, current } = key.getState(view.state)!;
  return { current: matches.length ? current + 1 : 0, total: matches.length };
};

/** Busca `query` e vai para o primeiro resultado. */
export function search(view: EditorView, query: string): SearchResult {
  view.dispatch(view.state.tr.setMeta(key, { query, current: 0 }));
  scrollToCurrent(view);
  return result(view);
}

/** Vai para o próximo (+1) ou anterior (-1) resultado, voltando ao início/fim. */
export function moveSearch(view: EditorView, delta: 1 | -1): SearchResult {
  const { matches, current } = key.getState(view.state)!;
  if (!matches.length) return result(view);
  const next = (current + delta + matches.length) % matches.length;
  view.dispatch(view.state.tr.setMeta(key, { current: next }));
  scrollToCurrent(view);
  return result(view);
}
