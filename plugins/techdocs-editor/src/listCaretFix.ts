import { $prose } from '@milkdown/kit/utils';
import { Plugin, PluginKey } from '@milkdown/kit/prose/state';
import type { EditorView } from '@milkdown/kit/prose/view';

/**
 * Letras trocadas ao digitar logo depois de criar um item de lista ("oisd" em vez de "dois").
 *
 * O item de lista do Crepe (@milkdown/components, list-item-block) monta o conteúdo do item depois
 * de criado (o cursor do navegador vai para o começo dele), guarda a posição do cursor e a devolve no
 * próximo quadro de animação. Com a máquina ocupada, a pessoa digita antes desse quadro: a posição
 * devolvida é a de antes da letra e o resto entra antes dela. Aqui essa devolução é descartada quando
 * o texto mudou depois da montagem e a posição pedida é exatamente a guardada (setas e cliques
 * passam), e o cursor do navegador volta para a posição atual (`focus` do ProseMirror). Rever ao
 * atualizar o Milkdown (7.22.3 ainda tem o problema).
 */
const key = new PluginKey('docs-editor-list-caret-fix');

type Capture = { anchor: number; head: number; stale: boolean };

export const listCaretFixPlugin = $prose(() => {
  let capture: Capture | undefined;
  let frame = 0;
  let current: EditorView | undefined;
  const seen = new WeakSet<Element>();

  const track = (view: EditorView, docChanged: boolean) => {
    const mounted = [...view.dom.querySelectorAll('.milkdown-list-item-block')].filter(item => !seen.has(item));
    if (mounted.length === 0) {
      if (capture && docChanged) capture.stale = true;
      return;
    }
    mounted.forEach(item => seen.add(item));
    // A mesma posição que o Crepe guarda: a do estado em que o item foi montado
    const { anchor, head } = view.state.selection;
    capture = { anchor, head, stale: false };
    // Agendado depois do quadro do Crepe (os itens montam antes das views dos plugins)
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      capture = undefined;
    });
  };

  return new Plugin({
    key,
    filterTransaction(tr) {
      if (!capture?.stale || tr.docChanged || !tr.selectionSet) return true;
      const { anchor, head } = tr.selection;
      if (anchor !== capture.anchor || head !== capture.head) return true;
      // O estado fica na posição atual; o cursor do navegador, que o item moveu, volta para ela
      queueMicrotask(() => {
        if (current && !current.isDestroyed && current.hasFocus()) current.focus();
      });
      return false;
    },
    view(view) {
      current = view;
      track(view, false);
      return {
        update: (updated, prevState) => track(updated, !updated.state.doc.eq(prevState.doc)),
        destroy: () => cancelAnimationFrame(frame),
      };
    },
  });
});
