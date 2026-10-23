import { useEffect, useRef } from 'react';

type Options = {
  /** false para parar (ex.: sem PR aberto). Mudar `resetKey` ou ligar de novo consulta na hora. */
  enabled: boolean;
  /** Consulta. Erros são de quem chama: aqui só se agenda a próxima. */
  run: () => Promise<unknown>;
  /** Espera até a próxima consulta, decidida depois de cada uma (ex.: 8 s com check rodando, 60 s parado). */
  delayMs: () => number;
  /** Quando muda, recomeça: consulta na hora e reagenda. */
  resetKey?: unknown;
};

/**
 * Consulta periódica ao GitHub com backoff: o intervalo é escolhido depois de cada consulta e, com a
 * aba em segundo plano, nada é consultado. Ao voltar para a aba, consulta na hora.
 */
export function usePolling({ enabled, run, delayMs, resetKey }: Options) {
  const latest = useRef({ run, delayMs });
  latest.current = { run, delayMs };

  useEffect(() => {
    if (!enabled) return undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    let running = false;

    const schedule = () => {
      clearTimeout(timer);
      if (!stopped && !document.hidden) timer = setTimeout(tick, latest.current.delayMs());
    };
    async function tick() {
      if (stopped || running) return;
      running = true;
      try {
        await latest.current.run();
      } catch {
        // quem chama mostra o erro; a consulta segue
      } finally {
        running = false;
        schedule();
      }
    }
    const onVisibility = () => {
      if (document.hidden) clearTimeout(timer);
      else tick();
    };

    document.addEventListener('visibilitychange', onVisibility);
    if (!document.hidden) tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [enabled, resetKey]);
}
