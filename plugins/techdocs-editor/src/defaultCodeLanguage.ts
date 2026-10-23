import { $prose } from '@milkdown/kit/utils';
import { Plugin, Transaction } from '@milkdown/kit/prose/state';
import { DEFAULT_CODE_LANG } from '@edtroleis/plugin-techdocs-editor-common';

/**
 * Plugin do editor: bloco de código criado sem linguagem ganha `text` na hora, para a pessoa ver
 * no editor o mesmo que vai ser salvo (o markdownlint exige linguagem: MD040).
 */
export const defaultCodeLanguagePlugin = $prose(
  () =>
    new Plugin({
      appendTransaction: (transactions, _oldState, state) => {
        if (!transactions.some(t => t.docChanged)) return null;
        let tr: Transaction | null = null;
        state.doc.descendants((node, pos) => {
          if (node.type.name === 'code_block' && !node.attrs.language) {
            tr = (tr ?? state.tr).setNodeMarkup(pos, undefined, { ...node.attrs, language: DEFAULT_CODE_LANG });
          }
        });
        return tr;
      },
    }),
);
