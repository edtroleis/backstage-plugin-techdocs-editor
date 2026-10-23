import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { EditorState } from '@codemirror/state';
import {
  EditorView,
  drawSelection,
  highlightActiveLine,
  highlightActiveLineGutter,
  keymap,
  lineNumbers,
} from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, redo, undo } from '@codemirror/commands';
import { bracketMatching, foldGutter, foldKeymap, indentOnInput } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { markdown } from '@codemirror/lang-markdown';
import { lintGutter, setDiagnostics } from '@codemirror/lint';
import { highlightSelectionMatches, openSearchPanel, search, searchKeymap } from '@codemirror/search';
import { vscodeDark } from './vscodeTheme';

/** Problema apontado pela pipeline numa linha do arquivo. */
export type SourceProblem = { line: number; message: string };

export type MarkdownSourceHandle = {
  /** Rola até a linha, seleciona e foca. */
  goToLine: (line: number) => void;
  /** Abre a barra de busca (a mesma do Ctrl+F). */
  openSearch: () => void;
  undo: () => void;
  redo: () => void;
};

type Props = {
  /** Conteúdo inicial; trocar o valor recria o editor. */
  initialValue: string;
  onChange: (markdown: string) => void;
  problems: SourceProblem[];
  /** Textos da busca (Ctrl+F) e das marcas de problema, no idioma da pessoa (markdownViewPhrases). */
  phrases: Record<string, string>;
  /** Chamado quando o editor existe (e a cada vez que é recriado): `goToLine` já funciona. */
  onReady?: () => void;
};

/**
 * Visão Markdown do arquivo, com os mesmos números de linha da pipeline e marcas nas linhas
 * com problema. Também serve para quem está aprendendo ver o Markdown por trás do visual.
 */
export const MarkdownSource = forwardRef<MarkdownSourceHandle, Props>(
  ({ initialValue, onChange, problems, phrases, onReady }, ref) => {
    const root = useRef<HTMLDivElement>(null);
    const view = useRef<EditorView>();
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const phrasesRef = useRef(phrases);
    phrasesRef.current = phrases;
    const onReadyRef = useRef(onReady);
    onReadyRef.current = onReady;

    useEffect(() => {
      const editor = new EditorView({
        parent: root.current!,
        state: EditorState.create({
          doc: initialValue,
          extensions: [
            lineNumbers(),
            foldGutter(),
            lintGutter(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            drawSelection(),
            bracketMatching(),
            indentOnInput(),
            history(),
            search({ top: true }),
            highlightSelectionMatches(),
            keymap.of([...searchKeymap, ...foldKeymap, ...defaultKeymap, ...historyKeymap]),
            EditorState.phrases.of(phrasesRef.current),
            // Realce também dentro dos blocos de código (bash, yaml, json…), carregado sob demanda
            markdown({ codeLanguages: languages }),
            vscodeDark,
            EditorView.lineWrapping,
            EditorView.updateListener.of(update => {
              if (update.docChanged) onChangeRef.current(update.state.doc.toString());
            }),
          ],
        }),
      });
      view.current = editor;
      onReadyRef.current?.();
      return () => editor.destroy();
    }, [initialValue]);

    useEffect(() => {
      const editor = view.current;
      if (!editor) return;
      const doc = editor.state.doc;
      const diagnostics = problems
        .filter(p => p.line >= 1 && p.line <= doc.lines)
        .map(p => ({ from: doc.line(p.line).from, to: doc.line(p.line).to, severity: 'error' as const, message: p.message }));
      editor.dispatch(setDiagnostics(editor.state, diagnostics));
    }, [problems, initialValue]);

    useImperativeHandle(ref, () => ({
      goToLine(line: number) {
        const editor = view.current;
        if (!editor) return;
        const target = editor.state.doc.line(Math.min(Math.max(1, line), editor.state.doc.lines));
        editor.dispatch({
          selection: { anchor: target.from, head: target.to },
          effects: EditorView.scrollIntoView(target.from, { y: 'center' }),
        });
        editor.focus();
      },
      openSearch() {
        if (view.current) openSearchPanel(view.current);
      },
      undo() {
        if (view.current) undo(view.current);
      },
      redo() {
        if (view.current) redo(view.current);
      },
    }));

    return <div ref={root} />;
  },
);
