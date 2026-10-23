/**
 * Cliente mínimo da API do GitHub, com dois transportes:
 * - user:  direto no GitHub com o token do próprio usuário (produção): o RBAC do GitHub decide.
 * - proxy: pelo proxy do backend do Backstage, com o token do servidor (demo com guest).
 */

/** API REST do github.com. No GitHub Enterprise é o `apiBaseUrl` da integração (ex.: https://ghe.empresa/api/v3). */
export const DEFAULT_API_BASE_URL = 'https://api.github.com';

/** GraphQL: no github.com fica em api.github.com/graphql; no Enterprise, em <host>/api/graphql (a REST em /api/v3). */
export const graphqlUrl = (apiBaseUrl: string) => `${apiBaseUrl.replace(/\/api\/v3$/, '/api')}/graphql`;

export type GitHubTransport = {
  baseUrl: string;
  fetch: typeof fetch;
  headers: Record<string, string>;
};

/**
 * De onde vem o token do usuário. `renew`: o GitHub recusou o token (401: revogado ou trocado por
 * outro login, ex.: ao aceitar um escopo novo); pede um novo à sessão em vez do guardado.
 */
export type TokenSource = (options: { renew: boolean }) => Promise<string | undefined>;

/**
 * Direto no GitHub com o token do usuário. Com `TokenSource`, o token é lido a cada chamada (segue a
 * sessão do Backstage, que pode trocá-lo) e, num 401, renovado e a chamada repetida uma vez.
 */
export const userTransport = (token: string | TokenSource, apiBaseUrl = DEFAULT_API_BASE_URL): GitHubTransport => {
  const baseUrl = apiBaseUrl.replace(/\/+$/, '');
  if (typeof token === 'string') {
    return { baseUrl, fetch: (input, init) => fetch(input, init), headers: { Authorization: `Bearer ${token}` } };
  }
  const send = (input: RequestInfo | URL, init: RequestInit | undefined, value: string) =>
    fetch(input, { ...init, headers: { ...(init?.headers as Record<string, string>), Authorization: `Bearer ${value}` } });
  return {
    baseUrl,
    headers: {},
    fetch: async (input, init) => {
      const current = await token({ renew: false });
      const res = await send(input, init, current ?? '');
      if (res.status !== 401) return res;
      const renewed = await token({ renew: true });
      return renewed && renewed !== current ? send(input, init, renewed) : res;
    },
  };
};

/** O proxy injeta o token do servidor; o fetch do Backstage envia a identidade do usuário. */
export const proxyTransport = (proxyUrl: string, backstageFetch: typeof fetch): GitHubTransport => ({
  baseUrl: proxyUrl,
  fetch: backstageFetch,
  headers: {},
});

export class GitHubError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export type Repo = {
  defaultBranch: string;
  canWrite: boolean;
  /** Pode mudar as configurações e os rulesets do repositório (setup). */
  isAdmin: boolean;
  htmlUrl: string;
  /**
   * Merge só por squash, com o título e a descrição do PR (spec 02, F6). O GitHub só devolve essas
   * opções para quem é admin; para os outros fica `undefined`.
   */
  squashWithPrMessage?: boolean;
};

/** Configurações de merge que o setup aplica (`PATCH /repos/{slug}`). */
export const SQUASH_MERGE_SETTINGS = {
  allow_squash_merge: true,
  allow_merge_commit: false,
  allow_rebase_merge: false,
  squash_merge_commit_title: 'PR_TITLE',
  squash_merge_commit_message: 'PR_BODY',
  delete_branch_on_merge: true,
} as const;

export type RepoFile = { content: string; sha: string };

export type BranchRules = {
  /** Algum ruleset ativo exige PR para mudar a branch. */
  requiresPullRequest: boolean;
  requiredApprovals: number;
  /** Nomes dos checks que precisam passar (os jobs da pipeline), dos rulesets e da proteção clássica. */
  requiredChecks: string[];
};

export type PullRequest = {
  number: number;
  nodeId: string;
  htmlUrl: string;
  draft: boolean;
  state: 'open' | 'closed';
  merged: boolean;
  headSha: string;
};

/** Versão publicada de um arquivo: um commit da branch principal que o alterou. */
export type FileVersion = {
  sha: string;
  /** Primeira linha da mensagem do commit (no editor, "docs: atualiza ..."). */
  title: string;
  /** ISO 8601, como o GitHub devolve. */
  date: string;
  author: string;
};

/** PR aberto de qualquer pessoa, para avisar quem vai editar a mesma página. */
export type OpenPullRequest = {
  number: number;
  htmlUrl: string;
  title: string;
  author: string;
  draft: boolean;
  branch: string;
};

/** Comparação entre a main e o rascunho (`GET /compare/{base}...{head}`). */
type Comparison = {
  /** Commits da base que o rascunho ainda não tem (publicados depois que ele começou). */
  behindBy: number;
  /** Último commit comum: a versão de onde os dois lados partiram. */
  mergeBase: string;
  /** Arquivos que o rascunho mudou desde o commit comum (`sha` = blob; ausente se removido). */
  files: Array<{ path: string; removed: boolean; sha?: string; previousPath?: string }>;
};

/** Item de árvore do Git: conteúdo novo, blob existente ou `sha: null` para remover. */
export type TreeEntry = { path: string; content?: string; sha?: string | null };

export type CheckRun = {
  id: number;
  name: string;
  status: 'queued' | 'in_progress' | 'completed' | string;
  conclusion: string | null;
  htmlUrl: string;
  /** Commit status (a API de CIs externos como Jenkins e CircleCI): sem apontamentos de linha. */
  source?: 'status';
};

export type Annotation = {
  path: string;
  line: number;
  level: string;
  message: string;
  /** Trecho do texto perto da linha apontada (preenchido pelo editor), para achar o ponto sem número de linha. */
  snippet?: string;
};

function toBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function fromBase64(b64: string): string {
  const binary = atob(b64.replace(/\n/g, ''));
  return new TextDecoder().decode(Uint8Array.from(binary, c => c.charCodeAt(0)));
}

const encodePath = (path: string) => path.split('/').map(encodeURIComponent).join('/');

function toPullRequest(pr: any): PullRequest {
  return {
    number: pr.number,
    nodeId: pr.node_id,
    htmlUrl: pr.html_url,
    draft: pr.draft,
    state: pr.state,
    merged: Boolean(pr.merged_at),
    headSha: pr.head.sha,
  };
}

/** Estado de um commit status (pending, success, failure, error) como a conclusão de um check. */
const statusConclusion = (state: string): string | null => {
  if (state === 'pending') return null;
  return state === 'success' ? 'success' : 'failure';
};

export class GitHubClient {
  /** Última resposta de cada GET com ETag: a próxima consulta é condicional e um 304 não conta no limite do GitHub. */
  private readonly etags = new Map<string, { etag: string; data: unknown }>();

  constructor(private readonly transport: GitHubTransport, readonly slug: string) {}

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const url = `${this.transport.baseUrl}${path}`;
    const cached = method === 'GET' ? this.etags.get(url) : undefined;
    const res = await this.transport.fetch(url, {
      method,
      // O GitHub responde com Cache-Control: max-age=60; com cache, um rascunho descartado
      // (branch apagada) continuava aparecendo por até um minuto. A validação fica com o ETag abaixo,
      // que sempre pergunta ao GitHub
      cache: 'no-store',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...this.transport.headers,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(cached ? { 'If-None-Match': cached.etag } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 304 && cached) return cached.data as T;
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new GitHubError(data.message ?? res.statusText, res.status);
    }
    if (res.status === 204) return undefined as T;
    const data = await res.json();
    const etag = res.headers.get('etag');
    if (method === 'GET' && etag) this.etags.set(url, { etag, data });
    return data;
  }

  private async graphql(query: string, variables: Record<string, unknown>) {
    const res = await this.transport.fetch(graphqlUrl(this.transport.baseUrl), {
      method: 'POST',
      headers: { ...this.transport.headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
    });
    const data = await res.json();
    if (!res.ok || data.errors?.length) {
      throw new GitHubError(data.errors?.[0]?.message ?? res.statusText, res.status);
    }
    return data.data;
  }

  private async orNull<T>(promise: Promise<T>): Promise<T | null> {
    try {
      return await promise;
    } catch (e) {
      if (e instanceof GitHubError && e.status === 404) return null;
      throw e;
    }
  }

  async getLogin(): Promise<string> {
    const user = await this.request<any>('GET', '/user');
    return user.login;
  }

  async getRepo(): Promise<Repo> {
    const repo = await this.request<any>('GET', `/repos/${this.slug}`);
    return {
      defaultBranch: repo.default_branch,
      canWrite: Boolean(repo.permissions?.push),
      isAdmin: Boolean(repo.permissions?.admin),
      htmlUrl: repo.html_url,
      squashWithPrMessage:
        repo.allow_squash_merge === undefined
          ? undefined
          : Object.entries(SQUASH_MERGE_SETTINGS).every(([key, value]) => key === 'delete_branch_on_merge' || repo[key] === value),
    };
  }

  /** Muda as configurações do repositório (precisa de admin). */
  async updateRepo(settings: Record<string, unknown>): Promise<void> {
    await this.request('PATCH', `/repos/${this.slug}`, settings);
  }

  /** Cria o ruleset `ruleset.name` ou, se já existir, troca as regras dele (precisa de admin). */
  async saveRuleset(ruleset: { name: string } & Record<string, unknown>): Promise<void> {
    const existing = (await this.request<any[]>('GET', `/repos/${this.slug}/rulesets`)).find(r => r.name === ruleset.name);
    if (existing) await this.request('PUT', `/repos/${this.slug}/rulesets/${existing.id}`, ruleset);
    else await this.request('POST', `/repos/${this.slug}/rulesets`, ruleset);
  }

  /**
   * O que a branch exige para o merge: aprovações e checks obrigatórios, dos rulesets e da proteção
   * de branch clássica (que o GitHub mostra a quem só lê, no resumo da branch).
   */
  async getBranchRules(branch: string): Promise<BranchRules> {
    const [rules, summary] = await Promise.all([
      this.request<any[]>('GET', `/repos/${this.slug}/rules/branches/${encodePath(branch)}`),
      // Informação a mais: se a consulta falhar, valem só os rulesets
      this.request<any>('GET', `/repos/${this.slug}/branches/${encodePath(branch)}`).catch(() => null),
    ]);
    const classic = summary?.protection?.required_status_checks;
    const classicChecks: string[] = [
      ...(classic?.contexts ?? []),
      ...(classic?.checks ?? []).map((c: { context: string }) => c.context),
    ];
    return {
      requiresPullRequest: rules.some(r => r.type === 'pull_request'),
      requiredApprovals: Math.max(
        0,
        ...rules
          .filter(r => r.type === 'pull_request')
          .map(r => r.parameters?.required_approving_review_count ?? 0),
      ),
      requiredChecks: [
        ...new Set([
          ...rules
            .filter(r => r.type === 'required_status_checks')
            .flatMap(r => r.parameters?.required_status_checks ?? [])
            .map((c: { context: string }) => c.context),
          ...classicChecks,
        ]),
      ],
    };
  }

  /** O repositório tem algum workflow do GitHub Actions (sem ele, nenhuma verificação roda nos PRs). */
  async hasWorkflows(): Promise<boolean> {
    const res = await this.request<{ total_count: number }>('GET', `/repos/${this.slug}/actions/workflows?per_page=1`);
    return res.total_count > 0;
  }

  async getFile(path: string, ref: string): Promise<RepoFile | null> {
    const file = await this.orNull(
      this.request<any>('GET', `/repos/${this.slug}/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`),
    );
    if (!file || Array.isArray(file)) return null;
    return { content: fromBase64(file.content), sha: file.sha };
  }

  async getBranchSha(branch: string): Promise<string | null> {
    const ref = await this.orNull(
      this.request<any>('GET', `/repos/${this.slug}/git/ref/heads/${encodePath(branch)}`),
    );
    return ref?.object.sha ?? null;
  }

  async createBranch(branch: string, fromSha: string): Promise<void> {
    await this.request('POST', `/repos/${this.slug}/git/refs`, { ref: `refs/heads/${branch}`, sha: fromSha });
  }

  async deleteBranch(branch: string): Promise<void> {
    await this.orNull(this.request('DELETE', `/repos/${this.slug}/git/refs/heads/${encodePath(branch)}`));
  }

  /** Um commit com um arquivo. Devolve o SHA do novo arquivo e o do commit. */
  async putFile(path: string, branch: string, content: string, sha: string | undefined, message: string) {
    const res = await this.request<any>('PUT', `/repos/${this.slug}/contents/${encodePath(path)}`, {
      message,
      content: toBase64(content),
      branch,
      ...(sha ? { sha } : {}),
    });
    return { sha: res.content.sha as string, commitSha: res.commit.sha as string };
  }

  /** Mensagem do último commit da branch. */
  async getHeadMessage(branch: string): Promise<string> {
    const commit = await this.request<any>('GET', `/repos/${this.slug}/commits/${encodePath(branch)}`);
    return commit.commit.message as string;
  }

  /** Commit sem mudança de arquivo na ponta da branch (para disparar a pipeline de novo). Devolve o SHA. */
  async createEmptyCommit(branch: string, message: string): Promise<string> {
    const parent = (await this.getBranchSha(branch))!;
    const sha = await this.createCommit(message, await this.getCommitTree(parent), [parent]);
    await this.updateBranch(branch, sha);
    return sha;
  }

  async getCommitTree(sha: string): Promise<string> {
    const commit = await this.request<any>('GET', `/repos/${this.slug}/git/commits/${sha}`);
    return commit.tree.sha;
  }

  /** Árvore nova a partir de `baseTree` com as entradas trocadas. Devolve o SHA. */
  async createTree(baseTree: string, entries: TreeEntry[]): Promise<string> {
    const tree = await this.request<any>('POST', `/repos/${this.slug}/git/trees`, {
      base_tree: baseTree,
      tree: entries.map(e => ({
        path: e.path,
        mode: '100644',
        type: 'blob',
        ...(e.content !== undefined ? { content: e.content } : { sha: e.sha ?? null }),
      })),
    });
    return tree.sha;
  }

  async createCommit(message: string, tree: string, parents: string[]): Promise<string> {
    const commit = await this.request<any>('POST', `/repos/${this.slug}/git/commits`, { message, tree, parents });
    return commit.sha;
  }

  async updateBranch(branch: string, sha: string, force = false): Promise<void> {
    await this.request('PATCH', `/repos/${this.slug}/git/refs/heads/${encodePath(branch)}`, { sha, ...(force ? { force } : {}) });
  }

  async compare(base: string, head: string): Promise<Comparison> {
    const res = await this.request<any>('GET', `/repos/${this.slug}/compare/${encodePath(`${base}...${head}`)}`);
    return {
      behindBy: res.behind_by,
      mergeBase: res.merge_base_commit.sha,
      files: (res.files ?? []).map((f: any) => ({
        path: f.filename,
        removed: f.status === 'removed',
        sha: f.status === 'removed' ? undefined : f.sha,
        previousPath: f.previous_filename,
      })),
    };
  }

  /**
   * Merge de `from` em `branch` feito pelo GitHub (`POST /merges`). Devolve o SHA do commit, ou null
   * se não havia nada para trazer. Com conflito, o GitHub responde 409 (GitHubError).
   */
  async mergeInto(branch: string, from: string, message: string): Promise<string | null> {
    const res = await this.request<any>('POST', `/repos/${this.slug}/merges`, {
      base: branch,
      head: from,
      commit_message: message,
    });
    return res?.sha ?? null;
  }

  async findOpenPullRequest(branch: string): Promise<PullRequest | null> {
    const owner = this.slug.split('/')[0];
    const prs = await this.request<any[]>(
      'GET',
      `/repos/${this.slug}/pulls?state=open&head=${encodeURIComponent(`${owner}:${branch}`)}`,
    );
    return prs.length ? toPullRequest(prs[0]) : null;
  }

  /** PRs abertos (de qualquer pessoa) que alteram `path`. Olha os 30 mais recentes. */
  async findOpenPullRequestsForFile(path: string): Promise<OpenPullRequest[]> {
    const prs = await this.request<any[]>('GET', `/repos/${this.slug}/pulls?state=open&per_page=30`);
    const touching = await Promise.all(
      prs.map(async pr => {
        const files = await this.request<any[]>('GET', `/repos/${this.slug}/pulls/${pr.number}/files?per_page=100`);
        return files.some(f => f.filename === path) ? pr : null;
      }),
    );
    return touching
      .filter(Boolean)
      .map(pr => ({
        number: pr.number,
        htmlUrl: pr.html_url,
        title: pr.title,
        author: pr.user?.login ?? '',
        draft: pr.draft,
        branch: pr.head.ref,
      }));
  }

  /** Versões de `path` em `ref` (commits que alteraram o arquivo), da mais nova para a mais antiga. */
  async getFileHistory(path: string, ref: string, limit = 30): Promise<FileVersion[]> {
    const query = new URLSearchParams({ sha: ref, path, per_page: String(limit) });
    const commits = await this.request<any[]>('GET', `/repos/${this.slug}/commits?${query}`);
    return commits.map(c => ({
      sha: c.sha,
      title: String(c.commit.message).split('\n')[0],
      date: c.commit.committer?.date ?? c.commit.author?.date ?? '',
      author: c.author?.login ?? c.commit.author?.name ?? '',
    }));
  }

  async getPullRequest(number: number): Promise<PullRequest> {
    return toPullRequest(await this.request<any>('GET', `/repos/${this.slug}/pulls/${number}`));
  }

  async createDraftPullRequest(opts: { branch: string; base: string; title: string; body: string }) {
    return this.createPullRequest({ ...opts, draft: true });
  }

  async createPullRequest(opts: { branch: string; base: string; title: string; body: string; draft: boolean }) {
    const pr = await this.request<any>('POST', `/repos/${this.slug}/pulls`, {
      title: opts.title,
      head: opts.branch,
      base: opts.base,
      body: opts.body,
      draft: opts.draft,
    });
    return toPullRequest(pr);
  }

  async closePullRequest(number: number): Promise<void> {
    await this.request('PATCH', `/repos/${this.slug}/pulls/${number}`, { state: 'closed' });
  }

  /** Tira o PR de rascunho (só existe na API GraphQL). */
  async markReadyForReview(nodeId: string): Promise<void> {
    await this.graphql(
      'mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId } }',
      { id: nodeId },
    );
  }

  async getCheckRuns(sha: string): Promise<CheckRun[]> {
    const res = await this.request<any>('GET', `/repos/${this.slug}/commits/${sha}/check-runs?per_page=100`);
    return res.check_runs.map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status,
      conclusion: c.conclusion,
      htmlUrl: c.html_url,
    }));
  }

  /**
   * Commit statuses (a API anterior aos checks, usada por CIs externos como Jenkins e CircleCI), no
   * formato dos checks. O GitHub devolve o último status de cada `context`.
   */
  async getCommitStatuses(sha: string): Promise<CheckRun[]> {
    const res = await this.request<any>('GET', `/repos/${this.slug}/commits/${sha}/status?per_page=100`);
    return (res.statuses ?? []).map((s: any) => ({
      id: s.id,
      name: s.context,
      status: s.state === 'pending' ? 'in_progress' : 'completed',
      conclusion: statusConclusion(s.state),
      htmlUrl: s.target_url ?? '',
      source: 'status' as const,
    }));
  }

  /**
   * Todas as verificações do commit: os checks e os commit statuses, qualquer que seja a pipeline.
   * Um status com o nome de um check repete o check (há CIs que reportam dos dois jeitos) e sai.
   */
  async getVerifications(sha: string): Promise<CheckRun[]> {
    const [runs, statuses] = await Promise.all([this.getCheckRuns(sha), this.getCommitStatuses(sha)]);
    const names = new Set(runs.map(r => r.name));
    return [...runs, ...statuses.filter(s => !names.has(s.name))];
  }

  async getAnnotations(checkRunId: number): Promise<Annotation[]> {
    const res = await this.request<any[]>('GET', `/repos/${this.slug}/check-runs/${checkRunId}/annotations`);
    return res.map(a => ({ path: a.path, line: a.start_line, level: a.annotation_level, message: a.message }));
  }

  /** Commit de um arquivo binário (conteúdo já em base64), ex.: imagem. */
  async putBinary(path: string, branch: string, base64: string, message: string): Promise<void> {
    await this.request('PUT', `/repos/${this.slug}/contents/${encodePath(path)}`, {
      message,
      content: base64,
      branch,
    });
  }

  /** Conteúdo bruto de um arquivo (ex.: imagem para exibir no editor), ou null se não existir. */
  async getRaw(path: string, ref: string): Promise<Blob | null> {
    const res = await this.transport.fetch(
      `${this.transport.baseUrl}/repos/${this.slug}/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`,
      { headers: { Accept: 'application/vnd.github.raw', ...this.transport.headers } },
    );
    // Uma pasta também responde 200 (com a listagem em JSON): não é um arquivo
    if (!res.ok || res.headers.get('content-type')?.includes('application/json')) return null;
    return res.blob();
  }
}
