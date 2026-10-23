import type { EditSession } from '@edtroleis/plugin-techdocs-editor-common';

/** Texto não salvo guardado no navegador, com a versão do arquivo em que se baseia. */
export type LocalDraft = { markdown: string; contentSha: string };

export const localKey = (slug: string, path: string) => `docs-editor:${slug}:${path}`;

export const syncTarget = (s: EditSession) => ({ branch: s.branch, base: s.repo.defaultBranch, filePath: s.filePath });

export function readLocalDraft(key: string): LocalDraft | undefined {
  try {
    return JSON.parse(localStorage.getItem(key) ?? 'null') ?? undefined;
  } catch {
    return undefined;
  }
}

export function writeLocalDraft(key: string, draft: LocalDraft | undefined) {
  try {
    if (draft) localStorage.setItem(key, JSON.stringify(draft));
    else localStorage.removeItem(key);
  } catch {
    // Sem localStorage (ex.: janela privada): o rascunho só fica salvo ao clicar em salvar
  }
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    // data:<tipo>;base64,<conteúdo>
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/** Primeiro Título 1, mesmo dentro de citação ("> # Título"). */
export const titleOf = (markdown: string, fallback: string) =>
  markdown.match(/^(?:>\s*)*#\s+(.+)$/m)?.[1].trim() ?? fallback;
