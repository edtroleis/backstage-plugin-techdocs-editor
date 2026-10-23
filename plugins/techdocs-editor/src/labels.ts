import type { BlockEditFeatureConfig } from '@milkdown/crepe/feature/block-edit';
import type { ToolbarFeatureConfig } from '@milkdown/crepe/feature/toolbar';

/** Busca um texto traduzido pela chave (ex.: "editorText.quote"), com as variáveis. */
export type TextLookup = (key: string, vars?: Record<string, string | number>) => string;

/**
 * Textos do editor visual (o Crepe vem em inglês e não usa a tradução do Backstage). Montados por
 * quem usa o editor, a partir da tradução (`editorTextFrom`).
 */
export type EditorText = {
  placeholder: string;
  paragraph: string;
  heading: (level: number) => string;
  text: string;
  lists: string;
  others: string;
  bulletList: string;
  orderedList: string;
  taskList: string;
  image: string;
  codeBlock: string;
  table: string;
  quote: string;
  divider: string;
  bold: string;
  italic: string;
  strikethrough: string;
  inlineCode: string;
  link: string;
  linkPlaceholder: string;
  topBar: { bold: string; italic: string; table: string; divider: string; undo: string; redo: string };
  uploadImage: string;
  uploadImageInline: string;
  imageUrlPlaceholder: string;
  imageUrlPlaceholderInline: string;
  imageCaption: string;
  problemMark: string;
};

export function editorTextFrom(t: TextLookup): EditorText {
  const k = (key: string) => t(`editorText.${key}`);
  return {
    placeholder: k('placeholder'),
    paragraph: k('paragraph'),
    heading: level => t('editorText.heading', { level }),
    text: k('text'),
    lists: k('lists'),
    others: k('others'),
    bulletList: k('bulletList'),
    orderedList: k('orderedList'),
    taskList: k('taskList'),
    image: k('image'),
    codeBlock: k('codeBlock'),
    table: k('table'),
    quote: k('quote'),
    divider: k('divider'),
    bold: k('bold'),
    italic: k('italic'),
    strikethrough: k('strikethrough'),
    inlineCode: k('inlineCode'),
    link: k('link'),
    linkPlaceholder: k('linkPlaceholder'),
    topBar: {
      bold: k('topBar.bold'),
      italic: k('topBar.italic'),
      table: k('topBar.table'),
      divider: k('topBar.divider'),
      undo: k('topBar.undo'),
      redo: k('topBar.redo'),
    },
    uploadImage: k('uploadImage'),
    uploadImageInline: k('uploadImageInline'),
    imageUrlPlaceholder: k('imageUrlPlaceholder'),
    imageUrlPlaceholderInline: k('imageUrlPlaceholderInline'),
    imageCaption: k('imageCaption'),
    problemMark: k('problemMark'),
  };
}

/** Opções do seletor de título da barra fixa. */
export const headingOptions = (text: EditorText) => [
  { label: text.paragraph, level: null },
  ...[1, 2, 3, 4, 5, 6].map(level => ({ label: text.heading(level), level })),
];

/** Menu "/" (o filtro do menu usa estes nomes: "/tab" acha "Tabela"). */
export const slashMenu = (text: EditorText): BlockEditFeatureConfig => ({
  textGroup: {
    label: text.text,
    text: { label: text.text },
    h1: { label: text.heading(1) },
    h2: { label: text.heading(2) },
    h3: { label: text.heading(3) },
    h4: { label: text.heading(4) },
    h5: { label: text.heading(5) },
    h6: { label: text.heading(6) },
    quote: { label: text.quote },
    divider: { label: text.divider },
  },
  listGroup: {
    label: text.lists,
    bulletList: { label: text.bulletList },
    orderedList: { label: text.orderedList },
    taskList: { label: text.taskList },
  },
  advancedGroup: {
    label: text.others,
    image: { label: text.image },
    codeBlock: { label: text.codeBlock },
    table: { label: text.table },
  },
});

/** Toolbar que aparece sobre o texto selecionado. */
export const selectionToolbar = (text: EditorText): ToolbarFeatureConfig => ({
  boldLabel: text.bold,
  italicLabel: text.italic,
  strikethroughLabel: text.strikethrough,
  codeLabel: text.inlineCode,
  linkLabel: text.link,
});

/**
 * Nome de cada botão da barra fixa, na ordem em que aparecem (Crepe + topBar.ts). O Crepe não
 * aceita nome nesses botões: sem isto eram só ícones, sem dica ao passar o mouse nem nome para
 * leitor de tela.
 */
const topBarLabels = (text: EditorText) => [
  text.topBar.bold,
  text.topBar.italic,
  text.strikethrough,
  text.inlineCode,
  text.bulletList,
  text.orderedList,
  text.taskList,
  text.link,
  text.image,
  text.topBar.table,
  text.codeBlock,
  text.quote,
  text.topBar.divider,
  text.topBar.undo,
  text.topBar.redo,
];

/** Põe nome (title e aria-label) nos botões da barra fixa dentro de `root`. */
export function labelTopBar(root: HTMLElement, text: EditorText) {
  const labels = topBarLabels(text);
  root.querySelectorAll<HTMLElement>('.top-bar-item').forEach((button, i) => {
    const label = labels[i];
    if (label && button.title !== label) {
      button.title = label;
      button.setAttribute('aria-label', label);
    }
  });
}

/** Textos da busca (Ctrl+F) e das marcas de problema da visão Markdown (frases do CodeMirror). */
export const markdownViewPhrases = (t: TextLookup): Record<string, string> => {
  const k = (key: string) => t(`markdownView.${key}`);
  return {
    Find: k('find'),
    Replace: k('replace'),
    next: k('next'),
    previous: k('previous'),
    all: k('all'),
    'match case': k('matchCase'),
    'by word': k('byWord'),
    regexp: k('regexp'),
    replace: k('replaceOne'),
    'replace all': k('replaceAll'),
    close: k('close'),
    'current match': k('currentMatch'),
    'on line': k('onLine'),
    'Go to line': k('goToLine'),
    go: k('go'),
    Diagnostics: k('diagnostics'),
    'No diagnostics': k('noDiagnostics'),
  };
};
