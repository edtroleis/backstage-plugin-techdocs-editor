import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef, useState } from 'react';
import {
  type Annotation,
  type CheckRun,
  type GitHubClient,
  isFailed,
  type PullRequest,
  relevantAnnotations,
  snippetAt,
} from '@edtroleis/plugin-techdocs-editor-common';
import { usePolling } from './usePolling';

type Options = {
  client?: GitHubClient;
  pr: PullRequest | null;
  setPr: Dispatch<SetStateAction<PullRequest | null>>;
  /**
   * Commit gravado pelo último "Salvar e verificar": logo depois do commit o GitHub ainda devolve o
   * PR apontando para o commit anterior, e o painel mostraria as verificações antigas.
   */
  expectedHead: MutableRefObject<string | undefined>;
  /** Intervalo entre as consultas enquanto algo pode mudar: check rodando, sem check ainda ou PR esperando publicação. */
  pollMs: number;
  /** Intervalo com tudo parado: PR em rascunho e todos os checks terminados. */
  idlePollMs: number;
  /** Sem nenhum check depois desse tempo, `stalled` avisa que o GitHub não iniciou verificações. */
  startTimeoutMs: number;
  /** Mensagem de erro para a pessoa (traduzida). */
  errorText: (e: unknown) => string;
};

/**
 * Verificações da pipeline do PR do rascunho: consulta enquanto o PR está aberto (a cada `pollMs` com
 * algo andando, `idlePollMs` parado, nada com a aba em segundo plano) e, para as que falharam, busca
 * os apontamentos com o trecho de texto da linha.
 */
export function useChecks({ client, pr, setPr, expectedHead, pollMs, idlePollMs, startTimeoutMs, errorText }: Options) {
  const [checks, setChecks] = useState<CheckRun[]>([]);
  const [annotations, setAnnotations] = useState<Record<number, Annotation[]>>({});
  const [pollError, setPollError] = useState<string>();
  const [stalled, setStalled] = useState(false);
  // Desde quando o commit atual espera o primeiro check
  const waitingSince = useRef(Date.now());
  // Resultado da última consulta: algo ainda pode mudar sem a pessoa fazer nada
  const active = useRef(true);

  const refresh = useCallback(async () => {
    if (!client || !pr) return;
    const latest = await client.getPullRequest(pr.number);
    // Só as verificações do último commit salvo, mesmo que o PR ainda não tenha sido atualizado
    const head = expectedHead.current ?? latest.headSha;
    if (latest.headSha === expectedHead.current) expectedHead.current = undefined;
    // Checks e commit statuses (CIs externos). Jobs pulados (ex.: publicação, que só roda na main)
    // não são verificações do rascunho
    const runs = (await client.getVerifications(head)).filter(r => r.conclusion !== 'skipped');
    // Salvou de novo enquanto esta consulta rodava: o resultado é de um commit antigo
    if ((expectedHead.current ?? head) !== head) return;
    setPr({ ...latest, headSha: head });
    setChecks(runs);
    active.current = !latest.draft || runs.length === 0 || runs.some(r => r.status !== 'completed');
    setStalled(runs.length === 0 && Date.now() - waitingSince.current > startTimeoutMs);
    setPollError(undefined);
    // Commit statuses não têm apontamentos de linha
    const failed = runs.filter(r => isFailed(r) && r.source !== 'status' && !annotations[r.id]);
    if (failed.length) {
      // Número de linha não ajuda num editor visual: anexa o trecho de texto daquela linha
      const files = new Map<string, Promise<string | undefined>>();
      const fileAt = (path: string) => {
        if (!files.has(path)) files.set(path, client.getFile(path, head).then(f => f?.content));
        return files.get(path)!;
      };
      const entries = await Promise.all(
        failed.map(async r => {
          const found = relevantAnnotations(await client.getAnnotations(r.id));
          const withSnippets = await Promise.all(
            found.map(async a => {
              const content = await fileAt(a.path);
              return { ...a, snippet: content ? snippetAt(content, a.line) : undefined };
            }),
          );
          return [r.id, withSnippets] as const;
        }),
      );
      setAnnotations(prev => ({ ...prev, ...Object.fromEntries(entries) }));
    }
  }, [client, pr, setPr, expectedHead, annotations, startTimeoutMs]);

  // Recomeça (consulta na hora, intervalo curto) quando o PR ou o commit mudam
  const resetKey = `${pr?.number}:${pr?.headSha}:${pr?.draft}`;
  const lastReset = useRef<string>();
  usePolling({
    enabled: pr?.state === 'open',
    resetKey,
    run: () => {
      if (lastReset.current !== resetKey) {
        lastReset.current = resetKey;
        waitingSince.current = Date.now();
        active.current = true;
        setStalled(false);
      }
      return refresh().catch(e => setPollError(errorText(e)));
    },
    delayMs: () => (active.current ? pollMs : idlePollMs),
  });

  /** Ao salvar, o resultado anterior some na hora: vale só para a versão antiga. */
  const clearChecks = useCallback(() => {
    setChecks([]);
    setAnnotations({});
    setPollError(undefined);
  }, []);

  return { checks, annotations, pollError, stalled, clearChecks };
}
