import { useCallback, useRef, useState } from 'react';
import { fromEditor, toEditor } from '@edtroleis/plugin-techdocs-editor-common';
import { localKey, writeLocalDraft } from './editorUtils';
import type { LoadedEditor } from './useEditorSession';

export type EditorMode = 'visual' | 'markdown';

/**
 * O texto em edição: o que o editor mostra, o que ainda não foi salvo e a versão salva. O Markdown do
 * editor (`toEditor`) e o do repositório (`fromEditor`) são formatos diferentes; aqui fica claro qual
 * é qual.
 */
export function useEditorDocument({ client, session, markdown, restored: restoredLocal }: LoadedEditor) {
  // Texto com que o editor visual é criado; muda junto com `editorKey`
  const [initialValue, setInitialValue] = useState(markdown);
  // Incrementar recria o editor (ex.: ao descartar, mesmo que o texto original seja igual)
  const [editorKey, setEditorKey] = useState(0);
  // Markdown editado ainda não salvo no GitHub (undefined = sem alterações pendentes)
  const [pending, setPending] = useState<string | undefined>(restoredLocal ? markdown : undefined);
  // Alteração não salva recuperada do navegador
  const [restored, setRestored] = useState(restoredLocal);
  // Markdown atual do editor (salvo ou não); usado ao salvar de novo sem edição
  const latestMarkdown = useRef(markdown);
  // Arquivo como está no último commit (ou na main); a visão Markdown o mostra sem ajustes
  // enquanto não há edição nova, para as linhas baterem com as apontadas pela pipeline
  const savedSource = useRef(session.rawContent);
  const [mode, setMode] = useState<EditorMode>('visual');
  // Conteúdo da visão Markdown (no formato do repositório, com as mesmas linhas da pipeline)
  const [sourceValue, setSourceValue] = useState('');
  const storageKey = localKey(client.slug, session.filePath);

  const onChange = useCallback(
    (text: string) => {
      latestMarkdown.current = text;
      setPending(text);
      writeLocalDraft(storageKey, { markdown: text, contentSha: session.contentSha });
    },
    [storageKey, session.contentSha],
  );

  /** Põe `content` (formato do repositório) nos dois modos, recriando o editor visual. */
  const show = useCallback((content: string) => {
    latestMarkdown.current = toEditor(content);
    setInitialValue(toEditor(content));
    setSourceValue(content);
    setEditorKey(k => k + 1);
  }, []);

  /** Como `show`, e `content` passa a ser a versão salva. */
  const showSaved = useCallback(
    (content: string) => {
      savedSource.current = content;
      show(content);
    },
    [show],
  );

  /** Depois de um commit do texto: o que foi salvo vira a referência e o rascunho local sai. */
  const markSaved = (content: string) => {
    savedSource.current = content;
    // Na visão Markdown, mostra o que foi salvo, com as linhas do novo commit
    if (mode === 'markdown') setSourceValue(content);
    setPending(undefined);
    setRestored(false);
    writeLocalDraft(storageKey, undefined);
  };

  /** Volta à versão salva, sem alteração pendente nem rascunho local. */
  const dropPending = () => {
    setPending(undefined);
    setRestored(false);
    writeLocalDraft(storageKey, undefined);
  };

  /** Alterna entre o editor visual e a visão Markdown, levando o texto atual. */
  const switchMode = (next: EditorMode) => {
    if (next === mode) return;
    if (next === 'markdown') {
      setSourceValue(pending === undefined ? savedSource.current : fromEditor(latestMarkdown.current));
    } else {
      setInitialValue(latestMarkdown.current);
      setEditorKey(k => k + 1);
    }
    setMode(next);
  };

  return {
    initialValue,
    editorKey,
    pending,
    restored,
    latestMarkdown,
    savedSource,
    mode,
    setMode,
    sourceValue,
    onChange,
    show,
    showSaved,
    markSaved,
    dropPending,
    switchMode,
  };
}

export type EditorDocument = ReturnType<typeof useEditorDocument>;
