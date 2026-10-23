import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const FONT = "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace";

/** Aparência do VS Code (tema Dark+) para a visão Markdown. */
const editorTheme = EditorView.theme(
  {
    '&': {
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
      fontSize: '14px',
      minHeight: '520px',
      borderRadius: '4px',
    },
    '.cm-scroller': { fontFamily: FONT, lineHeight: '1.6' },
    '.cm-content': { caretColor: '#aeafad', padding: '12px 0' },
    '&.cm-focused': { outline: 'none' },
    '&.cm-focused .cm-cursor': { borderLeftColor: '#aeafad', borderLeftWidth: '2px' },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection':
      { backgroundColor: '#264f78' },
    '.cm-activeLine': { backgroundColor: '#2a2d2e' },
    '.cm-selectionMatch': { backgroundColor: '#3a3d41' },
    '.cm-gutters': { backgroundColor: '#1e1e1e', color: '#858585', border: 'none', paddingLeft: '8px' },
    '.cm-activeLineGutter': { backgroundColor: 'transparent', color: '#c6c6c6' },
    '.cm-lineNumbers .cm-gutterElement': { minWidth: '32px', padding: '0 12px 0 0' },
    '.cm-foldGutter .cm-gutterElement': { color: '#c5c5c5', cursor: 'pointer' },
    '.cm-foldPlaceholder': { backgroundColor: '#3a3d41', border: 'none', color: '#c5c5c5' },
    '.cm-matchingBracket': { backgroundColor: '#0064001a', outline: '1px solid #888888' },
    // Busca (Ctrl+F)
    '.cm-searchMatch': { backgroundColor: '#623315', outline: '1px solid #f8b37e66' },
    '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#9e6a03' },
    '.cm-panels': { backgroundColor: '#252526', color: '#cccccc', fontFamily: 'inherit' },
    '.cm-panels.cm-panels-top': { borderBottom: '1px solid #454545' },
    '.cm-panel.cm-search': { padding: '6px 10px', fontSize: '13px' },
    '.cm-panel.cm-search label': { color: '#cccccc' },
    '.cm-textfield': {
      backgroundColor: '#3c3c3c',
      color: '#cccccc',
      border: '1px solid #3c3c3c',
      borderRadius: '2px',
      padding: '3px 6px',
    },
    '.cm-textfield:focus': { borderColor: '#007fd4', outline: 'none' },
    '.cm-button': {
      backgroundImage: 'none',
      backgroundColor: '#3a3d41',
      color: '#cccccc',
      border: 'none',
      borderRadius: '2px',
      padding: '3px 8px',
    },
    '.cm-button:hover': { backgroundColor: '#45494e' },
    '.cm-panel button[name=close]': { color: '#cccccc' },
    // Marcas de problema (pipeline)
    '.cm-tooltip': { backgroundColor: '#252526', color: '#cccccc', border: '1px solid #454545' },
    '.cm-lint-marker-error': { content: 'none' },
  },
  { dark: true },
);

/** Cores de sintaxe do Dark+ para Markdown e para o código dentro dos blocos. */
const highlightStyle = HighlightStyle.define([
  // Markdown
  { tag: t.heading, color: '#569cd6', fontWeight: 'bold' },
  { tag: t.strong, color: '#569cd6', fontWeight: 'bold' },
  { tag: t.emphasis, fontStyle: 'italic' },
  { tag: t.strikethrough, textDecoration: 'line-through' },
  { tag: t.link, color: '#4fc1ff' },
  { tag: t.url, color: '#ce9178', textDecoration: 'underline' },
  { tag: t.monospace, color: '#ce9178' },
  { tag: t.quote, color: '#6a9955' },
  { tag: t.list, color: '#6796e6' },
  { tag: [t.processingInstruction, t.contentSeparator, t.labelName], color: '#808080' },
  // Código
  { tag: [t.keyword, t.bool, t.null, t.tagName], color: '#569cd6' },
  { tag: [t.controlKeyword, t.moduleKeyword], color: '#c586c0' },
  { tag: [t.string, t.special(t.string)], color: '#ce9178' },
  { tag: t.comment, color: '#6a9955', fontStyle: 'italic' },
  { tag: t.number, color: '#b5cea8' },
  { tag: [t.typeName, t.className, t.namespace], color: '#4ec9b0' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: '#dcdcaa' },
  { tag: [t.variableName, t.propertyName, t.attributeName], color: '#9cdcfe' },
  { tag: [t.operator, t.punctuation], color: '#d4d4d4' },
  { tag: [t.meta, t.invalid], color: '#808080' },
]);

export const vscodeDark = [editorTheme, syntaxHighlighting(highlightStyle)];
