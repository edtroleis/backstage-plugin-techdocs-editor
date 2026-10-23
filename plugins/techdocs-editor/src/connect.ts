import { useCallback } from 'react';
import { discoveryApiRef, fetchApiRef, githubAuthApiRef, useApi } from '@backstage/core-plugin-api';
import { scmIntegrationsApiRef } from '@backstage/integration-react';
import {
  DEFAULT_API_BASE_URL,
  GitHubClient,
  proxyTransport,
  type TokenSource,
  userTransport,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useEditorConfig } from './config';

/** Endpoint do proxy do backend que injeta o token do servidor (só no modo `proxy`). */
const PROXY_ENDPOINT = 'techdocs-editor-github';

/** O Backstage não tem o login do GitHub (`auth.providers.github`): o editor não tem como agir no GitHub. */
export class GitHubSignInNotConfiguredError extends Error {
  constructor() {
    super('GitHub sign-in (auth.providers.github) is not configured in this Backstage');
  }
}

/**
 * O backend tem o provedor de login do GitHub? Sem ele, o popup do login abriria com um erro em JSON
 * ("No auth provider registered for 'github'"). O refresh responde 404 só quando o provedor não existe
 * (sem sessão é 401). Consultado uma vez por carregamento da página; erro de rede deixa o login tentar.
 */
let signInCheck: Promise<boolean> | undefined;
const githubSignInAvailable = (authBaseUrl: string) =>
  (signInCheck ??= fetch(`${authBaseUrl}/github/refresh?optional=true`, {
    headers: { 'x-requested-with': 'XMLHttpRequest' },
    credentials: 'include',
  }).then(
    res => res.status !== 404,
    () => true,
  ));

/**
 * Conecta ao GitHub do repositório `slug`:
 * - 'user' (padrão): com o token do próprio usuário; o GitHub decide o que a pessoa pode fazer;
 * - 'proxy' (demonstração): pelo proxy do backend, com o token do servidor.
 * `host`: o GitHub da documentação (GitHub Enterprise); a URL da API vem de `integrations.github`.
 * `optional`: sem login do GitHub ainda, devolve undefined em vez de abrir o popup (para avisos que
 * não devem incomodar quem só está lendo a página).
 * Sem o login do GitHub configurado no Backstage, falha com GitHubSignInNotConfiguredError em vez de
 * abrir o popup (que mostraria um erro técnico).
 * `extraScopes`: escopos além dos configurados, pedidos só para esta conexão (ex.: `workflow` no
 * setup); o Backstage pede o consentimento se a sessão ainda não os tiver.
 */
export function useGitHubConnector() {
  const discoveryApi = useApi(discoveryApiRef);
  const fetchApi = useApi(fetchApiRef);
  const githubAuth = useApi(githubAuthApiRef);
  const integrations = useApi(scmIntegrationsApiRef);
  const config = useEditorConfig();
  const proxyMode = config.auth === 'proxy';

  const connect = useCallback(
    async (
      slug: string,
      { optional = false, host, extraScopes = [] }: { optional?: boolean; host?: string; extraScopes?: string[] } = {},
    ) => {
      if (proxyMode) {
        const proxy = `${await discoveryApi.getBaseUrl('proxy')}/${PROXY_ENDPOINT}`;
        return new GitHubClient(proxyTransport(proxy, fetchApi.fetch), slug);
      }
      const scopes = [...config.scopes, ...extraScopes];
      if (!optional && !(await githubSignInAvailable(await discoveryApi.getBaseUrl('auth')))) {
        throw new GitHubSignInNotConfiguredError();
      }
      const token = await githubAuth.getAccessToken(scopes, { optional });
      if (!token) return undefined;
      const apiBaseUrl =
        integrations.github.byHost(host ?? config.githubHost)?.config.apiBaseUrl ?? DEFAULT_API_BASE_URL;
      // O token é lido da sessão a cada chamada: guardado, o editor aberto seguia com um token que o
      // GitHub já tinha trocado ("Bad credentials"). Num 401, a sessão é descartada e o Backstage
      // pede o login de novo (sem popup em quem só lê a página: `optional`). A sessão local some antes
      // do logout no backend; se o logout falhar (provedor sem logout), o login novo segue igual
      const source: TokenSource = async ({ renew }) => {
        if (renew && !optional) await githubAuth.signOut().catch(() => undefined);
        return githubAuth.getAccessToken(scopes, { optional });
      };
      return new GitHubClient(userTransport(source, apiBaseUrl), slug);
    },
    [proxyMode, discoveryApi, fetchApi, githubAuth, integrations, config.scopes, config.githubHost],
  );

  return { connect, proxyMode };
}
