import { DEFAULT_API_BASE_URL, GitHubClient, GitHubTransport, graphqlUrl, userTransport } from './github';

describe('GitHubClient', () => {
  it('consulta o GitHub sem cache do navegador (rascunho descartado não pode reaparecer)', async () => {
    const fetch = jest.fn(async () => new Response(JSON.stringify({ object: { sha: 'abc' } })));
    const transport: GitHubTransport = { baseUrl: 'https://api.github.com', fetch, headers: {} };
    const client = new GitHubClient(transport, 'dono/wiki');

    await client.getBranchSha('docs/pessoa/docs-index');

    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/repos/dono/wiki/git/ref/heads/docs/pessoa/docs-index',
      expect.objectContaining({ method: 'GET', cache: 'no-store' }),
    );
  });
});

describe('GitHub Enterprise', () => {
  it('GraphQL fica em /api/graphql no Enterprise e em /graphql no github.com', () => {
    expect(graphqlUrl('https://api.github.com')).toBe('https://api.github.com/graphql');
    expect(graphqlUrl('https://ghe.empresa.com/api/v3')).toBe('https://ghe.empresa.com/api/graphql');
  });

  it('o transporte do usuário usa a API da integração', () => {
    expect(userTransport('t').baseUrl).toBe(DEFAULT_API_BASE_URL);
    expect(userTransport('t', 'https://ghe.empresa.com/api/v3/').baseUrl).toBe('https://ghe.empresa.com/api/v3');
  });
});

describe('token do usuário lido da sessão', () => {
  const globalFetch = global.fetch;
  afterEach(() => {
    global.fetch = globalFetch;
  });
  const authOf = (call: unknown[]) => (call[1] as RequestInit).headers as Record<string, string>;

  it('num 401, pede um token novo e repete a chamada uma vez', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ object: { sha: 'abc' } })));
    const source = jest.fn(async ({ renew }: { renew: boolean }) => (renew ? 'novo' : 'velho'));
    const client = new GitHubClient(userTransport(source), 'dono/wiki');

    await expect(client.getBranchSha('main')).resolves.toBe('abc');
    const calls = (global.fetch as jest.Mock).mock.calls;
    expect(authOf(calls[0]).Authorization).toBe('Bearer velho');
    expect(authOf(calls[1]).Authorization).toBe('Bearer novo');
    expect(authOf(calls[1]).Accept).toBe('application/vnd.github+json');
  });

  it('sem token diferente, não repete e mostra o erro do GitHub', async () => {
    global.fetch = jest.fn(async () => new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 }));
    const client = new GitHubClient(userTransport(async () => 'velho'), 'dono/wiki');

    await expect(client.getBranchSha('main')).rejects.toThrow('Bad credentials');
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });
});

describe('requisições condicionais (ETag)', () => {
  const pull = { number: 7, node_id: 'n', html_url: 'u', draft: true, state: 'open', merged_at: null, head: { sha: 'abc' } };

  it('repete a consulta com If-None-Match e, no 304, devolve a resposta anterior', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(pull), { headers: { ETag: 'W/"1"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    const client = new GitHubClient({ baseUrl: 'https://api.github.com', fetch, headers: {} }, 'dono/wiki');

    const first = await client.getPullRequest(7);
    const second = await client.getPullRequest(7);

    expect(fetch.mock.calls[0][1].headers['If-None-Match']).toBeUndefined();
    expect(fetch.mock.calls[1][1].headers['If-None-Match']).toBe('W/"1"');
    expect(second).toEqual(first);
  });

  it('com mudança, o GitHub responde 200 e o ETag novo vale para a próxima', async () => {
    const fetch = jest
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(pull), { headers: { ETag: '"1"' } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ ...pull, head: { sha: 'def' } }), { headers: { ETag: '"2"' } }))
      .mockResolvedValueOnce(new Response(null, { status: 304 }));
    const client = new GitHubClient({ baseUrl: 'https://api.github.com', fetch, headers: {} }, 'dono/wiki');

    await client.getPullRequest(7);
    expect((await client.getPullRequest(7)).headSha).toBe('def');
    expect((await client.getPullRequest(7)).headSha).toBe('def');
    expect(fetch.mock.calls[2][1].headers['If-None-Match']).toBe('"2"');
  });

  it('escritas não são condicionais', async () => {
    const fetch = jest.fn(async () => new Response(JSON.stringify({ sha: 'x' }), { headers: { ETag: '"1"' } }));
    const client = new GitHubClient({ baseUrl: 'https://api.github.com', fetch, headers: {} }, 'dono/wiki');

    await client.createCommit('m', 'tree', ['p']);
    await client.createCommit('m', 'tree', ['p']);

    expect((fetch.mock.calls[1] as any)[1].headers['If-None-Match']).toBeUndefined();
  });
});
