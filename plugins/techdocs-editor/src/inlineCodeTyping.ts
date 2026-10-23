import { $prose } from '@milkdown/kit/utils';
import { EditorState, Plugin, PluginKey } from '@milkdown/kit/prose/state';
import type { EditorView } from '@milkdown/kit/prose/view';

/**
 * Botão de código no texto sem nada selecionado: o que for digitado em seguida vira código.
 *
 * O Crepe só guarda a marca para o próximo caractere, e a marca de código não se estende ao
 * digitar (é "não inclusiva", para dar para sair dela com a seta): saía `n`pm em vez de `npm`.
 * Aqui o modo fica ligado até a pessoa clicar de novo no botão ou mover o cursor.
 */
const key = new PluginKey<boolean>('docs-editor-inline-code-typing');

/** O modo "digitar como código" está ligado. */
export const inlineCodeTyping = (state: EditorState) => key.getState(state) ?? false;

/** Liga ou desliga o modo "digitar como código". */
export function toggleInlineCodeTyping(view: EditorView) {
  view.dispatch(view.state.tr.setMeta(key, !inlineCodeTyping(view.state)));
}

export const inlineCodeTypingPlugin = $prose(
  () =>
    new Plugin<boolean>({
      key,
      state: {
        init: () => false,
        apply(tr, active) {
          const meta = tr.getMeta(key) as boolean | undefined;
          if (meta !== undefined) return meta;
          // Cursor movido pela pessoa (clique, seta): sai do modo
          if (active && tr.selectionSet && !tr.docChanged) return false;
          return active;
        },
      },
      props: {
        handleTextInput(view, from, to, text) {
          if (!inlineCodeTyping(view.state)) return false;
          const mark = view.state.schema.marks.inlineCode.create();
          view.dispatch(view.state.tr.insertText(text, from, to).addMark(from, from + text.length, mark));
          return true;
        },
      },
    }),
);
