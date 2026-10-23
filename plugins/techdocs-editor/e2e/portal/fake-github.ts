import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
import type { Page, Route } from '@playwright/test';
import { conflictCount, merge3, resolveChunks } from '@edtroleis/plugin-techdocs-editor-common';

/**
 * GitHub simulado para os testes do painel: um repositório em memória com branches, commits, PRs
 * e execuções da pipeline. Intercepta todo o api.github.com (nada chega ao GitHub de verdade) e o
 * login do GitHub do Backstage (o editor recebe um token falso, sem popup).
 *
 * A pipeline segue as regras do GitHub Actions do workflow da wiki: roda ao abrir o PR e a cada
 * commit numa branch com PR aberto, e não roda se a mensagem do commit tiver "[skip ci]" nem se o PR
 * tiver conflito com a main.
 *
 * Merges (POST /merges, merge do PR) são de 3 vias como os do Git, com a mesma fusão por linha do
 * editor (merge3.ts): trechos separados entram os dois; o mesmo trecho é conflito.
 */

export const SLUG = 'edtroleis/docs-editor-wiki-demo';
export const LOGIN = 'pessoa-teste';
// Cópia fixa da wiki (wiki-fixture/): a wiki de verdade muda pelo próprio portal, os testes não podem mudar junto
const WIKI = join(__dirname, 'wiki-fixture');

/** Os 4 checks obrigatórios do ruleset (nomes dos jobs do workflow). */
export const CHECK_NAMES = ['Formatação do texto', 'Links', 'Dados sensíveis', 'Montagem da documentação'];

type Commit = { sha: string; message: string; parents: string[]; tree: string; date: string };
type PullRequest = {
  number: number;
  head: string;
  base: string;
  title: string;
  body: string;
  draft: boolean;
  state: 'open' | 'closed';
  mergedAt?: string;
  autoMerge: boolean;
  author: string;
};
type CheckResult = { conclusion: 'success' | 'failure'; annotations?: Array<{ path: string; line: number; message: string }> };
/** Resultado de cada check para uma execução (padrão: todos passam). */
export type PipelineOutcome = Record<string, CheckResult>;

/** Token do login com o escopo `workflow` (o GitHub simulado só aceita mudar workflows com ele). */
const WORKFLOW_TOKEN = 'token-falso-workflow';

const sha1 = (text: string) => createHash('sha1').update(text).digest('hex');

export function wikiFiles(dir = WIKI): Record<string, string> {
  return Object.fromEntries(
    readdirSync(dir).flatMap(name => {
      const path = join(dir, name);
      if (name === '.git' || name === 'site') return [];
      if (statSync(path).isDirectory()) return Object.entries(wikiFiles(path));
      return [[relative(WIKI, path), readFileSync(path, 'utf8')]];
    }),
  );
}

/** Situação de um arquivo entre duas árvores, como no compare do GitHub. */
const fileStatus = (before: string | undefined, after: string | undefined) => {
  if (after === undefined) return 'removed';
  return before === undefined ? 'added' : 'modified';
};

/** Resposta simulada: JSON ou conteúdo binário (imagens). */
type Reply = { status: number; json?: unknown; raw?: Buffer };

export class FakeGitHub {
  readonly commits = new Map<string, Commit>();
  readonly trees = new Map<string, Record<string, string>>();
  /** Conteúdo de cada blob (SHA = sha1 do conteúdo). */
  private readonly blobs = new Map<string, string>();
  readonly refs = new Map<string, string>();
  readonly pulls: PullRequest[] = [];
  /** SHAs em que a pipeline rodou, na ordem. */
  readonly pipelineRuns: string[] = [];
  /** Chamadas recebidas ("MÉTODO caminho"), para conferir o que o editor fez. */
  readonly calls: string[] = [];
  /** Chamadas respondidas com 304 (If-None-Match igual ao ETag): no GitHub, não contam no limite. */
  readonly notModified: string[] = [];
  requiredApprovals = 0;
  /** O repositório tem pipeline (workflows e checks obrigatórios). Sem ela, nenhum check roda. */
  hasPipeline = true;
  canWrite = true;
  /** Admin do repositório: o editor oferece "Configurar verificações" se faltar algo. */
  isAdmin = false;
  /** Opções de merge do repositório (o GitHub só as mostra para admin). */
  mergeSettings: Record<string, unknown> = {
    allow_squash_merge: true,
    allow_merge_commit: false,
    allow_rebase_merge: false,
    squash_merge_commit_title: 'PR_TITLE',
    squash_merge_commit_message: 'PR_BODY',
  };
  /** Há um ruleset na main (o da demo). Sem ele, e sem ruleset criado pelo setup, a main não exige PR. */
  hasRuleset = true;
  /** Rulesets criados ou trocados pela API (setup). */
  readonly rulesets: Array<{ id: number; name: string; rules: any[] }> = [];
  /** A pessoa já fez login do GitHub no portal (sem isto, o login opcional volta vazio). */
  signedIn = true;
  /** O Backstage não tem o provedor de login do GitHub (auth.providers.github): o refresh responde 404. */
  signInMissing = false;
  /**
   * A pessoa aceita dar o escopo `workflow` quando o editor pede (no GitHub de verdade, pela tela de
   * consentimento). Sem ele, o GitHub recusa criar ou alterar arquivos em .github/workflows/.
   */
  grantsWorkflowScope = true;
  /** Escopos pedidos ao login do GitHub, na ordem (para conferir que `workflow` só é pedido no setup). */
  readonly requestedScopes: string[] = [];
  /** Authorization da chamada em andamento. */
  private auth = '';
  /** Token que o login entrega agora (muda com `rotateToken`). */
  private userToken = 'token-falso';
  /** Tokens que o GitHub já não aceita (401 "Bad credentials"). */
  private readonly revoked = new Set<string>();
  /**
   * O GitHub troca o token da pessoa (novo login, outro escopo aceito, acesso revogado): o antigo
   * passa a dar 401 e o login do portal entrega um novo.
   */
  rotateToken() {
    this.revoked.add(this.userToken);
    this.userToken = `${this.userToken}-novo`;
  }

  /** Resultado da próxima execução da pipeline (depois volta ao padrão). */
  nextOutcome: PipelineOutcome | undefined;
  /**
   * Como no GitHub de verdade: depois de um commit, o PR continua apontando para o commit anterior
   * por esta quantidade de consultas.
   */
  prHeadLag = 0;
  /** A pipeline leva esta quantidade de consultas para registrar as verificações de um commit. */
  pipelineStartDelay = 0;
  private staleHead = new Map<string, { sha: string; remaining: number }>();
  private failures: Array<{ method: string; path: RegExp; status: number; message: string }> = [];

  /** A próxima chamada `method` cujo caminho casa com `path` falha com `status`. */
  failNext(method: string, path: RegExp, status: number, message: string) {
    this.failures.push({ method, path, status, message });
  }
  private pendingStart = new Map<string, number>();
  private outcomes = new Map<string, PipelineOutcome>();
  private counter = 0;

  constructor(files: Record<string, string> = wikiFiles()) {
    this.refs.set('main', this.commit('docs: wiki de demonstração', files).sha);
  }

  // ------------------------------------------------------------ estado (para os testes)

  /** Arquivos na ponta da branch (ou num commit, pelo SHA). */
  files(branch = 'main'): Record<string, string> | undefined {
    const sha = this.refs.get(branch) ?? (this.commits.has(branch) ? branch : undefined);
    return sha ? this.trees.get(this.commits.get(sha)!.tree) : undefined;
  }

  file(path: string, branch = 'main'): string | undefined {
    return this.files(branch)?.[path];
  }

  /** Commits da branch que a main não tem (pelo primeiro pai), do mais antigo ao mais novo. */
  branchCommits(branch: string): Commit[] {
    const inMain = this.ancestors(this.refs.get('main')!);
    const out: Commit[] = [];
    for (let sha = this.refs.get(branch); sha && !inMain.has(sha); sha = this.commits.get(sha)!.parents[0]) {
      out.unshift(this.commits.get(sha)!);
    }
    return out;
  }

  /** Outra pessoa publica uma alteração na main (PR dela já aceito). */
  publishOnMain(path: string, content: string, author = 'outra-pessoa') {
    this.writeCommit('main', `docs: altera ${path} (por ${author})`, { [path]: content });
  }

  /** O PR tem conflito com a main (o GitHub mostra "This branch has conflicts"). */
  hasConflict(pr: PullRequest) {
    return this.mergeFiles(this.refs.get(pr.head)!, this.refs.get(pr.base)!) === null;
  }

  openPull(): PullRequest | undefined {
    return this.pulls.find(p => p.state === 'open');
  }

  /**
   * Outra pessoa abre um PR que altera `path` (pronto para revisão). Com `branch`, o PR vem de uma
   * branch qualquer (ex.: a própria pessoa, fora do editor).
   */
  openPullFromOther(author: string, path: string, content: string, branch = `docs/${author}/${path.replace(/\.md$/, '').replace(/[^A-Za-z0-9._-]+/g, '-')}`) {
    this.refs.set(branch, this.refs.get('main')!);
    this.writeCommit(branch, `docs: altera ${path}`, { [path]: content });
    const pr: PullRequest = {
      number: this.pulls.length + 1,
      head: branch,
      base: 'main',
      title: `docs: altera ${path}`,
      body: '',
      draft: false,
      state: 'open',
      autoMerge: false,
      author,
    };
    this.pulls.push(pr);
    this.runPipeline(this.refs.get(branch)!);
    return pr;
  }

  /** Alguém faz o merge do PR no GitHub (o editor não faz merge). */
  mergeOnGitHub(pr: PullRequest) {
    this.merge(pr);
  }

  /** Arquivos que o PR altera em relação ao commit comum com a main (como a aba "Files changed"). */
  private changedFiles(pr: PullRequest) {
    const headSha = this.refs.get(pr.head)!;
    return this.diffFiles(this.mergeBase(this.refs.get(pr.base)!, headSha), headSha).map(f => f.filename);
  }

  /** Alguém mudou o arquivo na branch fora do editor (para simular conflito). */
  commitOutside(branch: string, path: string, content: string) {
    this.writeCommit(branch, `edição externa de ${path}`, { [path]: content });
  }

  // ------------------------------------------------------------ git

  private commit(message: string, files: Record<string, string>, parents: string[] = []): Commit {
    const tree = this.tree(files);
    // Um commit por minuto a partir de 20/10/2026 10:00 (UTC): datas distintas e previsíveis
    const date = new Date(Date.UTC(2026, 9, 20, 10, this.counter)).toISOString();
    const commit = { sha: sha1(`${message}${tree}${parents.join()}${this.counter++}`), message, parents, tree, date };
    this.commits.set(commit.sha, commit);
    return commit;
  }

  private tree(files: Record<string, string>) {
    const sha = sha1(JSON.stringify(files));
    this.trees.set(sha, files);
    for (const content of Object.values(files)) this.blobs.set(sha1(content), content);
    return sha;
  }

  private filesAt(sha: string) {
    return this.trees.get(this.commits.get(sha)!.tree)!;
  }

  private ancestors(sha: string): Set<string> {
    const seen = new Set<string>();
    const queue = [sha];
    while (queue.length) {
      const next = queue.shift()!;
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...this.commits.get(next)!.parents);
    }
    return seen;
  }

  /** Último commit comum (o mais próximo de `b` que também está na história de `a`). */
  private mergeBase(a: string, b: string): string {
    const ofA = this.ancestors(a);
    const queue = [b];
    const seen = new Set<string>();
    while (queue.length) {
      const next = queue.shift()!;
      if (ofA.has(next)) return next;
      if (seen.has(next)) continue;
      seen.add(next);
      queue.push(...this.commits.get(next)!.parents);
    }
    throw new Error('Sem commit comum');
  }

  /** Arquivos que mudaram de `from` para `to`. */
  private diffFiles(from: string, to: string) {
    const a = this.filesAt(from);
    const b = this.filesAt(to);
    return [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter(f => a[f] !== b[f])
      .map(filename => ({
        filename,
        status: fileStatus(a[filename], b[filename]),
        sha: b[filename] === undefined ? undefined : sha1(b[filename]),
      }));
  }

  /** Merge de 3 vias dos arquivos de `ours` e `theirs`; null se houver conflito. */
  private mergeFiles(ours: string, theirs: string): Record<string, string> | null {
    const base = this.filesAt(this.mergeBase(ours, theirs));
    const o = this.filesAt(ours);
    const t = this.filesAt(theirs);
    const out: Record<string, string> = {};
    for (const path of new Set([...Object.keys(base), ...Object.keys(o), ...Object.keys(t)])) {
      const [b, mine, their] = [base[path], o[path], t[path]];
      let merged: string | undefined;
      if (mine === their || their === b) merged = mine;
      else if (mine === b) merged = their;
      else if (mine === undefined || their === undefined) return null;
      else {
        const chunks = merge3(b ?? '', mine, their);
        if (conflictCount(chunks)) return null;
        merged = resolveChunks(chunks, []);
      }
      if (merged !== undefined) out[path] = merged;
    }
    return out;
  }

  private writeCommit(branch: string, message: string, changes: Record<string, string | null>) {
    const files = { ...this.files(branch)! };
    for (const [path, content] of Object.entries(changes)) {
      if (content === null) delete files[path];
      else files[path] = content;
    }
    const commit = this.commit(message, files, [this.refs.get(branch)!]);
    this.moveRef(branch, commit.sha);
    return commit;
  }

  private moveRef(branch: string, sha: string) {
    const previous = this.refs.get(branch);
    if (previous && this.prHeadLag) this.staleHead.set(branch, { sha: previous, remaining: this.prHeadLag });
    this.refs.set(branch, sha);
    const pr = this.pulls.find(p => p.state === 'open' && p.head === branch);
    if (pr && !this.hasConflict(pr)) this.runPipeline(sha);
  }

  private runPipeline(sha: string) {
    if (!this.hasPipeline || this.commits.get(sha)!.message.includes('[skip ci]')) return;
    this.pipelineRuns.push(sha);
    if (this.pipelineStartDelay) this.pendingStart.set(sha, this.pipelineStartDelay);
    this.outcomes.set(sha, this.nextOutcome ?? {});
    this.nextOutcome = undefined;
  }

  private checkRuns(sha: string, polling = false) {
    const outcome = this.outcomes.get(sha);
    if (!outcome) return [];
    const wait = this.pendingStart.get(sha);
    if (polling && wait) {
      this.pendingStart.set(sha, wait - 1);
      return [];
    }
    return CHECK_NAMES.map((name, i) => ({
      id: this.checkId(sha, i),
      name,
      status: 'completed',
      conclusion: outcome[name]?.conclusion ?? 'success',
      html_url: `https://github.com/${SLUG}/runs/${i}`,
    }));
  }

  private checkId = (sha: string, index: number) => parseInt(sha.slice(0, 6), 16) * 10 + index;

  private annotations(id: number) {
    for (const [sha, outcome] of this.outcomes) {
      const index = CHECK_NAMES.findIndex((_, i) => this.checkId(sha, i) === id);
      if (index >= 0) {
        return (outcome[CHECK_NAMES[index]]?.annotations ?? []).map(a => ({
          path: a.path,
          start_line: a.line,
          annotation_level: 'failure',
          message: a.message,
        }));
      }
    }
    return [];
  }

  private allChecksPassed(sha: string) {
    const runs = this.checkRuns(sha);
    return runs.length > 0 && runs.every(r => r.conclusion === 'success');
  }

  /** Merge do PR (squash): com conflito, o GitHub não deixa. */
  private merge(pr: PullRequest) {
    const files = this.mergeFiles(this.refs.get(pr.head)!, this.refs.get('main')!);
    if (!files) throw new Error(`O PR #${pr.number} tem conflito com a main: o GitHub não deixa fazer o merge`);
    const commit = this.commit(`${pr.title} (#${pr.number})`, files, [this.refs.get('main')!]);
    this.refs.set('main', commit.sha);
    pr.state = 'closed';
    pr.mergedAt = new Date().toISOString();
  }

  // ------------------------------------------------------------ API

  private pullJson(pr: PullRequest, polling = false) {
    let headSha = this.refs.get(pr.head) ?? '';
    const stale = this.staleHead.get(pr.head);
    if (polling && stale?.remaining) {
      stale.remaining--;
      headSha = stale.sha;
    }
    return {
      number: pr.number,
      node_id: `PR_${pr.number}`,
      html_url: `https://github.com/${SLUG}/pull/${pr.number}`,
      draft: pr.draft,
      state: pr.state,
      merged_at: pr.mergedAt ?? null,
      mergeable: pr.state === 'open' ? !this.hasConflict(pr) : null,
      head: { ref: pr.head, sha: headSha },
      title: pr.title,
      user: { login: pr.author },
    };
  }

  /** Responde uma chamada; `undefined` = rota desconhecida. */
  private handle(method: string, url: URL, body: any, accept: string): Reply | undefined {
    const path = decodeURIComponent(url.pathname);
    const repo = `/repos/${SLUG}`;
    const ok = (json: unknown, status = 200) => ({ status, json });
    const notFound = { status: 404, json: { message: 'Not Found' } };

    if (method === 'GET' && path === '/user') return ok({ login: LOGIN });
    if (method === 'POST' && path === '/graphql') return this.graphql(body);
    if (!path.startsWith(repo)) return undefined;
    const rest = path.slice(repo.length);

    if (method === 'GET' && rest === '') {
      return ok({
        default_branch: 'main',
        permissions: { push: this.canWrite, admin: this.isAdmin },
        html_url: `https://github.com/${SLUG}`,
        ...(this.isAdmin ? this.mergeSettings : {}),
      });
    }
    if (method === 'PATCH' && rest === '') {
      if (!this.isAdmin) return { status: 403, json: { message: 'Must have admin rights to Repository.' } };
      Object.assign(this.mergeSettings, body);
      return ok({});
    }
    if (rest === '/rulesets' || rest.startsWith('/rulesets/')) {
      if (!this.isAdmin) return { status: 403, json: { message: 'Must have admin rights to Repository.' } };
      if (method === 'GET' && rest === '/rulesets') return ok(this.rulesets.map(({ id, name }) => ({ id, name })));
      if (method === 'POST') {
        this.rulesets.push({ id: this.rulesets.length + 1, name: body.name, rules: body.rules });
        return ok({ id: this.rulesets.length }, 201);
      }
      const existing = this.rulesets.find(r => `/rulesets/${r.id}` === rest);
      if (method === 'PUT' && existing) {
        existing.rules = body.rules;
        return ok({ id: existing.id });
      }
    }
    if (method === 'GET' && rest.startsWith('/rules/branches/')) {
      if (this.rulesets.length) return ok(this.rulesets.flatMap(r => r.rules));
      if (!this.hasRuleset) return ok([]);
      const rules: unknown[] = [{ type: 'pull_request', parameters: { required_approving_review_count: this.requiredApprovals } }];
      if (this.hasPipeline) {
        rules.push({
          type: 'required_status_checks',
          parameters: { required_status_checks: CHECK_NAMES.map(context => ({ context })) },
        });
      }
      return ok(rules);
    }
    if (method === 'GET' && rest === '/actions/workflows') {
      return ok({ total_count: this.hasPipeline ? 1 : 0, workflows: [] });
    }

    let m = rest.match(/^\/contents\/(.+)$/);
    if (m) {
      const filePath = m[1];
      if (method === 'GET') {
        const files = this.files(url.searchParams.get('ref') ?? 'main');
        const content = files?.[filePath];
        if (content === undefined) {
          // Pasta: listagem em JSON
          const isDir = files && Object.keys(files).some(f => f.startsWith(`${filePath}/`));
          return isDir ? ok([]) : notFound;
        }
        if (accept.includes('raw')) return { status: 200, raw: Buffer.from(content, 'base64') };
        return ok({ content: Buffer.from(content).toString('base64'), sha: sha1(content) });
      }
      if (method === 'PUT') {
        if (!this.refs.has(body.branch)) return notFound;
        const decoded = Buffer.from(body.content, 'base64');
        const current = this.file(filePath, body.branch);
        // Arquivo de texto guarda o texto; binário (imagem) guarda o base64
        const isText = /\.(md|ya?ml|json|txt)$/.test(filePath);
        if (isText && current !== undefined && body.sha !== sha1(current)) {
          return { status: 409, json: { message: `${filePath} does not match ${body.sha}` } };
        }
        const content = isText ? decoded.toString('utf8') : body.content;
        const commit = this.writeCommit(body.branch, body.message, { [filePath]: content });
        return ok({ content: { sha: sha1(content) }, commit: { sha: commit.sha } }, current === undefined ? 201 : 200);
      }
    }

    m = rest.match(/^\/git\/ref\/heads\/(.+)$/);
    if (m && method === 'GET') {
      const sha = this.refs.get(m[1]);
      return sha ? ok({ object: { sha } }) : notFound;
    }
    if ((method === 'POST' && rest === '/git/refs') || (method === 'PATCH' && rest.startsWith('/git/refs/heads/'))) {
      // Como o GitHub: mudar um workflow exige o escopo `workflow` do OAuth
      const workflow = this.diffFiles(this.refs.get('main')!, body.sha).find(f => f.filename.startsWith('.github/workflows/'));
      if (workflow && this.auth !== `Bearer ${WORKFLOW_TOKEN}`) {
        return {
          status: 404,
          json: { message: `refusing to allow an OAuth App to create or update workflow \`${workflow.filename}\` without \`workflow\` scope` },
        };
      }
    }
    if (method === 'POST' && rest === '/git/refs') {
      const branch = body.ref.replace('refs/heads/', '');
      if (this.refs.has(branch)) return { status: 422, json: { message: 'Reference already exists' } };
      this.refs.set(branch, body.sha);
      return ok({}, 201);
    }
    m = rest.match(/^\/git\/refs\/heads\/(.+)$/);
    if (m && method === 'DELETE') {
      if (!this.refs.delete(m[1])) return { status: 422, json: { message: 'Reference does not exist' } };
      return { status: 204 };
    }
    if (m && method === 'PATCH') {
      this.moveRef(m[1], body.sha);
      return ok({ object: { sha: body.sha } });
    }
    m = rest.match(/^\/git\/commits\/(\w+)$/);
    if (m && method === 'GET') {
      const commit = this.commits.get(m[1]);
      return commit ? ok({ sha: commit.sha, tree: { sha: commit.tree }, message: commit.message }) : notFound;
    }
    if (method === 'POST' && rest === '/git/commits') {
      const commit = this.commit(body.message, this.trees.get(body.tree)!, body.parents);
      return ok({ sha: commit.sha }, 201);
    }
    if (method === 'POST' && rest === '/git/trees') {
      const files = { ...this.trees.get(body.base_tree)! };
      for (const entry of body.tree) {
        if (entry.content !== undefined) files[entry.path] = entry.content;
        else if (entry.sha === null) delete files[entry.path];
        else files[entry.path] = this.blobs.get(entry.sha)!;
      }
      return ok({ sha: this.tree(files) }, 201);
    }

    m = rest.match(/^\/compare\/(.+)\.\.\.(.+)$/);
    if (m && method === 'GET') {
      const [base, head] = [this.refs.get(m[1]) ?? m[1], this.refs.get(m[2]) ?? m[2]];
      if (!this.commits.has(base) || !this.commits.has(head)) return notFound;
      const mergeBase = this.mergeBase(base, head);
      const count = (from: string, to: string) => {
        const before = this.ancestors(from);
        return [...this.ancestors(to)].filter(c => !before.has(c)).length;
      };
      return ok({
        merge_base_commit: { sha: mergeBase },
        ahead_by: count(base, head),
        behind_by: count(head, base),
        files: this.diffFiles(mergeBase, head),
      });
    }
    if (method === 'POST' && rest === '/merges') {
      const [into, from] = [this.refs.get(body.base), this.refs.get(body.head)];
      if (!into || !from) return notFound;
      if (this.ancestors(into).has(from)) return { status: 204 };
      const files = this.mergeFiles(into, from);
      if (!files) return { status: 409, json: { message: 'Merge conflict' } };
      const commit = this.commit(body.commit_message, files, [into, from]);
      this.moveRef(body.base, commit.sha);
      return ok({ sha: commit.sha }, 201);
    }

    m = rest.match(/^\/commits\/(\w+)\/check-runs$/);
    if (m && method === 'GET') return ok({ check_runs: this.checkRuns(m[1], true) });
    m = rest.match(/^\/check-runs\/(\d+)\/annotations$/);
    if (m && method === 'GET') return ok(this.annotations(Number(m[1])));
    // Histórico de um arquivo: commits da branch (pelo primeiro pai) em que o arquivo mudou
    if (method === 'GET' && rest === '/commits') {
      const filePath = url.searchParams.get('path') ?? '';
      const out = [];
      let sha: string | undefined = this.refs.get(url.searchParams.get('sha') ?? 'main');
      while (sha) {
        const commit: Commit = this.commits.get(sha)!;
        const parent = commit.parents[0];
        const before = parent ? this.trees.get(this.commits.get(parent)!.tree)![filePath] : undefined;
        if (this.trees.get(commit.tree)![filePath] !== before) {
          out.push({ sha, commit: { message: commit.message, committer: { date: commit.date } }, author: { login: LOGIN } });
        }
        sha = parent;
      }
      return ok(out);
    }
    m = rest.match(/^\/commits\/(.+)$/);
    if (m && method === 'GET') {
      const sha = this.refs.get(m[1]) ?? m[1];
      const commit = this.commits.get(sha);
      return commit ? ok({ sha, commit: { message: commit.message } }) : notFound;
    }

    if (method === 'GET' && rest === '/pulls') {
      const head = url.searchParams.get('head')?.split(':')[1];
      return ok(this.pulls.filter(p => p.state === 'open' && (!head || p.head === head)).map(p => this.pullJson(p)));
    }
    if (method === 'POST' && rest === '/pulls') {
      if (!this.branchCommits(body.head).length) {
        return { status: 422, json: { message: `No commits between main and ${body.head}` } };
      }
      const pr: PullRequest = {
        number: this.pulls.length + 1,
        head: body.head,
        base: body.base,
        title: body.title,
        body: body.body,
        draft: Boolean(body.draft),
        state: 'open',
        autoMerge: false,
        author: LOGIN,
      };
      this.pulls.push(pr);
      this.runPipeline(this.refs.get(pr.head)!);
      return ok(this.pullJson(pr), 201);
    }
    m = rest.match(/^\/pulls\/(\d+)\/files$/);
    if (m && method === 'GET') {
      const pr = this.pulls[Number(m[1]) - 1];
      return pr ? ok(this.changedFiles(pr).map(filename => ({ filename }))) : notFound;
    }
    m = rest.match(/^\/pulls\/(\d+)(\/merge)?$/);
    if (m) {
      const pr = this.pulls[Number(m[1]) - 1];
      if (!pr) return notFound;
      if (method === 'GET' && !m[2]) return ok(this.pullJson(pr, true));
      if (method === 'PATCH' && !m[2]) {
        if (body.state) pr.state = body.state;
        return ok(this.pullJson(pr));
      }
      if (method === 'PUT' && m[2]) {
        if (!this.allChecksPassed(this.refs.get(pr.head)!) || this.requiredApprovals > 0) {
          return { status: 405, json: { message: 'Pull Request is not mergeable' } };
        }
        this.merge(pr);
        return ok({ merged: true });
      }
    }
    return undefined;
  }

  private graphql(body: { query: string; variables: { id: string } }) {
    const pr = this.pulls[Number(body.variables.id.replace('PR_', '')) - 1];
    const error = (message: string) => ({ status: 200, json: { data: null, errors: [{ message }] } });
    if (!pr) return error('Could not resolve to a node');
    if (body.query.includes('markPullRequestReadyForReview')) {
      pr.draft = false;
      return { status: 200, json: { data: { markPullRequestReadyForReview: { clientMutationId: null } } } };
    }
    if (body.query.includes('enablePullRequestAutoMerge')) {
      // Como o GitHub: com tudo cumprido, recusa o auto-merge ("clean status")
      if (this.requiredApprovals === 0 && this.allChecksPassed(this.refs.get(pr.head)!)) {
        return error('Pull request is in clean status');
      }
      pr.autoMerge = true;
      return { status: 200, json: { data: { enablePullRequestAutoMerge: { clientMutationId: null } } } };
    }
    return error('Mutation não simulada');
  }

  // ------------------------------------------------------------ Playwright

  /** Intercepta o GitHub e o login do GitHub na página. */
  async install(page: Page) {
    const cors = {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'access-control-expose-headers': 'ETag',
    };
    await page.route('https://api.github.com/**', async (route: Route) => {
      const request = route.request();
      if (request.method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: cors });
        return;
      }
      const url = new URL(request.url());
      const body = request.postData() ? JSON.parse(request.postData()!) : undefined;
      const headers = await request.allHeaders();
      const accept = headers.accept ?? '';
      const call = `${request.method()} ${decodeURIComponent(url.pathname)}`;
      this.calls.push(call);
      this.auth = headers.authorization ?? '';
      if (this.revoked.has(this.auth.replace(/^Bearer /, ''))) {
        await route.fulfill({ status: 401, headers: cors, json: { message: 'Bad credentials' } });
        return;
      }
      const failure = this.failures.findIndex(
        f => f.method === request.method() && f.path.test(decodeURIComponent(url.pathname)),
      );
      const response: Reply | undefined =
        failure >= 0
          ? (({ status, message }) => ({ status, json: { message } }))(this.failures.splice(failure, 1)[0])
          : this.handle(request.method(), url, body, accept);
      if (!response) {
        // Nunca deixa passar para o GitHub de verdade
        this.calls.push(`NÃO SIMULADO: ${request.method()} ${url.pathname}`);
        await route.fulfill({ status: 501, headers: cors, json: { message: `Não simulado: ${request.method()} ${url.pathname}` } });
        return;
      }
      if (response.raw) {
        await route.fulfill({ status: response.status, headers: { ...cors, 'content-type': 'image/png' }, body: response.raw });
      } else if (response.json === undefined) {
        await route.fulfill({ status: response.status, headers: cors });
      } else if (request.method() === 'GET' && response.status === 200) {
        // Como o GitHub: ETag do conteúdo; a mesma resposta pedida com If-None-Match volta 304, sem corpo
        const etag = `"${sha1(JSON.stringify(response.json))}"`;
        if (headers['if-none-match'] === etag) {
          this.notModified.push(call);
          await route.fulfill({ status: 304, headers: { ...cors, etag } });
        } else {
          await route.fulfill({ status: 200, headers: { ...cors, etag }, json: response.json });
        }
      } else {
        await route.fulfill({ status: response.status, headers: cors, json: response.json });
      }
    });
    // Login do GitHub: sessão com token falso, sem popup. Com `workflow` pedido (setup), um token
    // que o GitHub simulado aceita para mudar workflows, se a pessoa consentir
    await page.route('**/api/auth/github/refresh**', route => {
      const scope = new URL(route.request().url()).searchParams.get('scope') ?? '';
      this.requestedScopes.push(scope);
      const workflow = scope.split(' ').includes('workflow');
      if (this.signInMissing) {
        return route.fulfill({
          status: 404,
          json: { error: { name: 'NotFoundError', message: "No auth provider registered for 'github'" } },
        });
      }
      if (!this.signedIn || (workflow && !this.grantsWorkflowScope)) {
        return route.fulfill({ status: 401, json: { error: { name: 'AuthenticationError', message: 'sem sessão' } } });
      }
      return route.fulfill({
        json: {
          profile: { displayName: 'Pessoa Teste' },
          providerInfo: {
            accessToken: workflow ? WORKFLOW_TOKEN : this.userToken,
            scope: workflow ? 'repo read:user workflow' : 'repo read:user',
            expiresInSeconds: 3600,
          },
        },
      });
    });
  }
}
