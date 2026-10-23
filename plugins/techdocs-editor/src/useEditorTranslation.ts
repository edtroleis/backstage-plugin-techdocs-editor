import { useCallback, useMemo } from 'react';
import { useTranslationRef } from '@backstage/core-plugin-api/alpha';
import {
  DraftFileMissingError,
  GitHubError,
  PageNotFoundError,
} from '@edtroleis/plugin-techdocs-editor-common';
import { techdocsEditorTranslationRef } from './translation';
import type ptBR from './translations/pt-BR';
import { editorTextFrom, markdownViewPhrases, TextLookup } from './labels';

/** Chave de mensagem do catálogo, sem os sufixos de plural (`_one`, `_other`): o plural vem do `count`. */
type MessageKey = keyof typeof ptBR extends infer K
  ? K extends `${infer Base}_one` | `${infer Base}_other`
    ? Base
    : K
  : never;

/**
 * `t` com tipo simples. O do Backstage calcula as chaves do catálogo inteiro a cada chamada e, com
 * centenas de chamadas, o tsc passava de 4 GB de memória. Aqui a chave continua conferida.
 */
interface Translate {
  (key: MessageKey, vars?: Record<string, string | number>): string;
  (key: MessageKey, vars: Record<string, string | number | JSX.Element>): JSX.Element;
}

/**
 * Tradução do editor: `t` com as chaves do techdocsEditorTranslationRef, mais o que os componentes
 * sem tradução própria precisam (textos do Milkdown e do CodeMirror), o texto de cada regra do lint e
 * as mensagens de erro.
 */
export function useEditorTranslation() {
  const { t: backstageT } = useTranslationRef(techdocsEditorTranslationRef);
  const t = backstageT as unknown as Translate;
  // Chaves montadas em tempo de execução (ex.: "lintRules.MD040")
  const lookup = useCallback<TextLookup>((key, vars) => (backstageT as unknown as TextLookup)(key, vars), [backstageT]);

  /** Texto da regra do markdownlint no idioma da pessoa; sem tradução, a descrição original. */
  const ruleText = useCallback(
    (rule: string | undefined, fallback: string) => {
      if (!rule) return fallback;
      const key = `lintRules.${rule}`;
      const text = lookup(key);
      // O i18next devolve a própria chave quando não há tradução
      return text === key ? fallback : text;
    },
    [lookup],
  );

  /** Mensagem de erro para a pessoa: os casos conhecidos explicados; o resto, a mensagem como veio. */
  const errorText = useCallback(
    (e: unknown): string => {
      if (e instanceof GitHubError && /SAML/i.test(e.message)) return t('errors.sso');
      if (e instanceof GitHubError && e.status === 409) return t('errors.changedMeanwhile');
      if (e instanceof PageNotFoundError) return t('errors.pageNotFound', { page: e.page || '/', dir: e.docsDir });
      if (e instanceof DraftFileMissingError) return t('errors.draftFileMissing', { file: e.filePath, branch: e.branch });
      return e instanceof Error ? e.message : String(e);
    },
    [t],
  );

  const editorText = useMemo(() => editorTextFrom(lookup), [lookup]);
  const phrases = useMemo(() => markdownViewPhrases(lookup), [lookup]);

  return { t, lookup, ruleText, errorText, editorText, phrases };
}
