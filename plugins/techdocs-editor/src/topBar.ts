import type { CrepeConfig, CrepeFeature } from '@milkdown/crepe';
import type { Ctx } from '@milkdown/kit/ctx';
import { editorViewCtx } from '@milkdown/kit/core';
import { deleteSelection, lift, setBlockType, wrapIn } from '@milkdown/kit/prose/commands';
import { redo, undo } from '@milkdown/kit/prose/history';
import { liftListItem } from '@milkdown/kit/prose/schema-list';
import { deleteTable } from '@milkdown/kit/prose/tables';
import { NodeSelection } from '@milkdown/kit/prose/state';
import type { Command, EditorState } from '@milkdown/kit/prose/state';
import { inlineCodeTyping, toggleInlineCodeTyping } from './inlineCodeTyping';

const icon = (path: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="${path}"/></svg>`;

const UNDO_ICON = icon(
  'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z',
);
const REDO_ICON = icon(
  'M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z',
);

/** Algum nó acima do cursor tem o tipo `name`. */
const inside = (state: EditorState, name: string) => {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === name) return true;
  }
  return false;
};

const inBlockquote = (state: EditorState) => inside(state, 'blockquote');
const inTable = (state: EditorState) => inside(state, 'table');
const inCodeBlock = (state: EditorState) =>
  inside(state, 'code_block') ||
  (state.selection instanceof NodeSelection && state.selection.node.type.name === 'code_block');

type ListKind = 'bullet' | 'ordered' | 'task';

/** Tipo da lista em que o cursor está (a mais interna), se estiver numa. */
function currentList(state: EditorState): ListKind | undefined {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const name = $from.node(depth).type.name;
    if (name === 'ordered_list') return 'ordered';
    if (name === 'bullet_list') {
      // Lista de tarefas é uma lista com marcador cujos itens têm "checked"
      const item = depth < $from.depth ? $from.node(depth + 1) : undefined;
      return item?.attrs.checked === null || item?.attrs.checked === undefined ? 'bullet' : 'task';
    }
  }
  return undefined;
}

/** Linha horizontal selecionada (clicar sobre ela a seleciona). */
const hrSelected = (state: EditorState) =>
  state.selection instanceof NodeSelection && state.selection.node.type.name === 'hr';

const run = (ctx: Ctx, command: Command) => {
  const view = ctx.get(editorViewCtx);
  command(view.state, view.dispatch);
  view.focus();
};

const stateOf = (ctx: Ctx) => ctx.get(editorViewCtx).state;

// Tipo do builder da barra do Crepe (não exportado pelo pacote)
type TopBarBuilder = Parameters<
  NonNullable<NonNullable<NonNullable<CrepeConfig['featureConfigs']>[CrepeFeature.TopBar]>['buildTopBar']>
>[0];
type TopBarItem = TopBarBuilder extends { getGroup: (key: string) => { group: { items: Array<infer I> } } }
  ? I
  : never;

/**
 * Ajustes na barra fixa do editor. O padrão do Crepe só adiciona: não havia como desfazer uma
 * lista, citação, tabela ou bloco de código criados sem querer (clicar de novo criava outro). Aqui
 * cada botão alterna, como no Word/Confluence, e mostra quando está ativo:
 * - listas: dentro da lista do mesmo tipo, tira o item da lista; dentro de outro tipo, troca o tipo;
 * - citação: dentro de uma citação, tira um nível;
 * - linha horizontal: com a linha selecionada, remove;
 * - tabela: com o cursor na tabela, remove a tabela;
 * - bloco de código: com o cursor no bloco, volta a ser parágrafo.
 * Também Desfazer/Refazer (antes só por Ctrl+Z / Ctrl+Y) e código no texto sem seleção valendo
 * para tudo o que for digitado (ver inlineCodeTyping.ts).
 */
export function buildTopBar(builder: TopBarBuilder) {
  const formatting = builder.getGroup('formatting');
  const inlineCode = (formatting.group.items as Array<TopBarItem & { key: string }>).find(i => i.key === 'code');
  if (inlineCode) {
    const isActive = inlineCode.active;
    const toggle = inlineCode.onRun;
    inlineCode.active = (ctx: Ctx) => inlineCodeTyping(stateOf(ctx)) || isActive(ctx);
    inlineCode.onRun = (ctx: Ctx) => {
      const view = ctx.get(editorViewCtx);
      // Sem seleção: liga/desliga "digitar como código" (o padrão só valia para uma letra)
      if (view.state.selection.empty) {
        toggleInlineCodeTyping(view);
        view.focus();
      } else {
        toggle?.(ctx);
      }
    };
  }

  const lists = builder.getGroup('list');
  const [bullet, ordered, task] = lists.group.items as TopBarItem[];
  const listButton = (kind: ListKind, original: TopBarItem) => ({
    icon: original.icon,
    active: (ctx: Ctx) => currentList(stateOf(ctx)) === kind,
    onRun: (ctx: Ctx) => {
      const state = stateOf(ctx);
      const current = currentList(state);
      if (current) run(ctx, liftListItem(state.schema.nodes.list_item));
      if (current !== kind) original.onRun?.(ctx);
      ctx.get(editorViewCtx).focus();
    },
  });
  lists
    .clear()
    .addItem('bullet-list', listButton('bullet', bullet))
    .addItem('ordered-list', listButton('ordered', ordered))
    .addItem('task-list', listButton('task', task));

  const insert = builder.getGroup('insert');
  const insertItems = insert.group.items as Array<TopBarItem & { key: string }>;
  const table = insertItems.find(i => i.key === 'table');
  if (table) {
    table.active = (ctx: Ctx) => inTable(stateOf(ctx));
    const addTable = table.onRun;
    table.onRun = (ctx: Ctx) => {
      if (inTable(stateOf(ctx))) run(ctx, deleteTable);
      else addTable?.(ctx);
    };
  }

  const block = builder.getGroup('block');
  const codeBlock = (block.group.items as Array<TopBarItem & { key: string }>).find(i => i.key === 'code-block');
  if (codeBlock) {
    codeBlock.active = (ctx: Ctx) => inCodeBlock(stateOf(ctx));
    const addCode = codeBlock.onRun;
    codeBlock.onRun = (ctx: Ctx) => {
      const state = stateOf(ctx);
      if (inCodeBlock(state)) run(ctx, setBlockType(state.schema.nodes.paragraph));
      else addCode?.(ctx);
    };
  }

  const more = builder.getGroup('more');
  const [quote, hr] = more.group.items as TopBarItem[];
  more
    .clear()
    .addItem('quote', {
      icon: quote.icon,
      active: (ctx: Ctx) => inBlockquote(stateOf(ctx)),
      onRun: (ctx: Ctx) => {
        const state = stateOf(ctx);
        run(ctx, inBlockquote(state) ? lift : wrapIn(state.schema.nodes.blockquote));
      },
    })
    .addItem('hr', {
      icon: hr.icon,
      active: (ctx: Ctx) => hrSelected(stateOf(ctx)),
      onRun: (ctx: Ctx) => {
        if (hrSelected(stateOf(ctx))) run(ctx, deleteSelection);
        else hr.onRun?.(ctx);
      },
    });

  builder
    .addGroup('history', 'Histórico')
    .addItem('undo', { icon: UNDO_ICON, active: () => false, onRun: (ctx: Ctx) => run(ctx, undo) })
    .addItem('redo', { icon: REDO_ICON, active: () => false, onRun: (ctx: Ctx) => run(ctx, redo) });
}
