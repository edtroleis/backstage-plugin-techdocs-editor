# TechDocs Editor

[English](README.md) · **Português**

Editor visual das páginas do TechDocs para quem não conhece Git: a pessoa clica no lápis da página,
escreve num editor parecido com um editor de texto comum e publica. Por baixo, o fluxo é o mesmo de
qualquer mudança de código no GitHub: branch, pull request, verificações da pipeline e merge.

- **Editor visual e visão Markdown** (Milkdown + CodeMirror), com a conversão fiel do Markdown do
  MkDocs (admonitions, abas, tabelas, imagens).
- **Lint na hora**, com as regras do `.markdownlint.*` do próprio repositório (as mesmas da pipeline)
  e correções automáticas.
- **Salvar rascunho** (só guarda, sem pipeline), **Salvar e verificar** (PR em rascunho + pipeline),
  **Enviar para publicação/revisão** (o rótulo segue as regras da branch no GitHub) e **Descartar**.
- **Verificações da pipeline em linguagem simples**, com "ver linha" no ponto do problema.
- **Conflitos**: o rascunho recebe o que foi publicado depois; se o mesmo trecho mudou, a pessoa
  escolhe o que fica.
- **Histórico** da página, com "Restaurar" uma versão anterior.
- Na página do TechDocs: lápis "Editar" (com ponto quando há rascunho), aviso de alterações
  aguardando publicação e as datas de criação e atualização no alto.

Quem pode escrever é decidido pelo GitHub: o editor age com o token da própria pessoa.

## Pacotes

| Pacote | Conteúdo |
|--------|----------|
| `@edtroleis/plugin-techdocs-editor` | Página do editor e addon do TechDocs (este pacote) |
| `@edtroleis/plugin-techdocs-editor-common` | Núcleo sem React: Markdown do MkDocs, lint, merge de 3 vias, cliente do GitHub, setup do repositório |
| `@edtroleis/plugin-scaffolder-backend-module-techdocs-editor` | Action do Scaffolder `techdocs-editor:setup` |

## Instalação

```bash
yarn --cwd packages/app add @edtroleis/plugin-techdocs-editor
```

O login do GitHub precisa estar configurado no Backstage (`auth.providers.github`); o editor pede o
popup só quando a pessoa clica em editar.

### Novo sistema de frontend

Com `app.packages: all`, a página é encontrada sozinha. O addon do TechDocs é um módulo à parte:

```tsx
// packages/app/src/App.tsx
import techdocsEditorPlugin, { techdocsEditorTechDocsModule } from '@edtroleis/plugin-techdocs-editor/alpha';

export default createApp({
  features: [techdocsEditorPlugin, techdocsEditorTechDocsModule],
});
```

A página fica em `/docs-editor`.

### Sistema de frontend antigo

```tsx
// packages/app/src/App.tsx
import { TechDocsEditorPage, TechDocsEditAddon } from '@edtroleis/plugin-techdocs-editor';

<Route path="/docs-editor" element={<TechDocsEditorPage />} />

<Route path="/docs/:namespace/:kind/:name/*" element={<TechDocsReaderPage />}>
  <TechDocsAddons>
    <TechDocsEditAddon />
  </TechDocsAddons>
</Route>
```

## Configuração

Tudo é opcional (schema em `config.d.ts`):

```yaml
techdocsEditor:
  github:
    auth: user            # user (padrão) | proxy (só demonstração)
    host: github.com      # quando a doc não informa; a API vem de integrations.github (GitHub Enterprise)
    scopes: [repo]        # [public_repo] basta para wikis só em repositórios públicos
  branchPattern: 'docs/{login}/{path}'
  drafts:
    skipCi: true          # "Salvar rascunho" com [skip ci]
  verification:
    mode: auto            # auto | pipeline | editor
    startTimeoutSeconds: 120
    checkHelp:            # mensagem em linguagem simples por nome de job da pipeline
      Links: Há links que não funcionam.
  polling:
    intervalSeconds: 8        # com check rodando ou PR esperando publicação
    idleIntervalSeconds: 60   # parado; com a aba em segundo plano, nenhuma consulta
```

Por documentação, a anotação `techdocs-editor/verification: pipeline | editor` vale sobre a configuração.

### Verificação: com e sem pipeline

| Repositório | O que "Salvar e verificar" confere | Enviar |
|-------------|-----------------------------------|--------|
| Com workflows ou checks obrigatórios (`mode: auto` detecta) | Os checks do GitHub no PR, com qualquer nome de job | Liberado quando nenhum check falhou |
| Sem workflows (`mode: auto` detecta) ou `mode: editor` | O lint do editor, com as regras do repositório; o painel explica que não há verificações automáticas | Liberado com o lint ok |

Se nenhum check começar em `startTimeoutSeconds`, o painel avisa e mostra o link do PR.

### Modos de uso

| Modo | Login no portal | Quem vê o lápis | Escrita no GitHub |
|------|-----------------|-----------------|-------------------|
| Demonstração | Guest | Owner da doc ou todos (política *allow all*) | `auth: proxy`: conta do servidor, pelo proxy `techdocs-editor-github` do backend; o editor avisa na tela |
| PoC | Guest ou o provedor existente | Owner da doc (antes do login do GitHub) | Token do próprio usuário |
| Produção | Provedor real | Permissão `techdocs-editor.page.edit` (abaixo) | Token do próprio usuário |

O modo `proxy` precisa do endpoint no proxy do backend, com o token de uma conta de serviço:

```yaml
proxy:
  endpoints:
    /techdocs-editor-github:
      target: https://api.github.com
      headers:
        Authorization: Bearer ${GITHUB_TOKEN}
      allowedMethods: [GET, POST, PUT, PATCH, DELETE]
      credentials: require   # só usuários logados no portal
```

### Permissão

O pacote `-common` exporta `techdocsEditorEditPermission` (`techdocs-editor.page.edit`), uma permissão
de recurso sobre a entidade do catálogo. Ela decide se o lápis aparece e se o editor abre; a escrita
continua dependendo do GitHub. Numa política, por exemplo, só o owner da documentação:

```ts
if (isPermission(request.permission, techdocsEditorEditPermission)) {
  return createCatalogConditionalDecision(request.permission, catalogConditions.isEntityOwner({
    claims: user?.info.ownershipEntityRefs ?? [],
  }));
}
```

Sem permission framework (ou com a política *allow all*), todos podem; vale então só o GitHub.

### GitHub Enterprise

O host vem do `backstage.io/source-location` da documentação (ou de `techdocsEditor.github.host`), e
a URL da API da integração desse host em `integrations.github`. O login do GitHub do Backstage precisa
estar configurado para o mesmo Enterprise (`auth.providers.github.<env>.enterpriseInstanceUrl`).

## Segurança

- **Token do GitHub**: vem do login do GitHub do Backstage e fica só em memória no navegador; o
  editor não grava o token nem o escreve em log. No `localStorage` fica apenas o texto do rascunho
  ainda não salvo.
- **Escopo mínimo**: o escopo `repo` do OAuth App dá escrita em *todos* os repositórios que a pessoa
  acessa, não só nas wikis. Em ordem de preferência:
  1. **GitHub App** no lugar do OAuth App (`auth.providers.github` aceita um App): o token vale só
     nos repositórios onde o App foi instalado, com as permissões `contents: write`,
     `pull_requests: write`, `checks: read` e `metadata: read`;
  2. wikis só em repositórios públicos: `scopes: [public_repo]`;
  3. OAuth App com `repo` (padrão), aceitando o alcance acima.
- **Navegador**: restrinja o `connect-src` do CSP ao backend e à API do GitHub configurada:

  ```yaml
  backend:
    csp:
      connect-src: ["'self'", 'https://api.github.com'] # GitHub Enterprise: https://<host>/api/v3
  ```

- **Conteúdo**: imagens enviadas só com tipo `image/*` e até `images.maxSizeMB`; HTML hostil no
  Markdown (scripts, links `javascript:`) é testado em `e2e/tests`.
- **Modo `proxy`**: todos escrevem com a mesma conta de serviço. Só para demonstração.
- **CI** (`.github/workflows/ci.yml`): lint, tipos, testes, `yarn npm audit` (falha em
  alta/crítica nas dependências do plugin; exceções sem correção ficam em `.yarnrc.yml` com o
  motivo), gitleaks e CodeQL.

## Requisitos da documentação

- Anotações `backstage.io/techdocs-ref` e `github.com/project-slug` no `catalog-info.yaml`.
- Merge por **squash** com a descrição do PR como mensagem: o rascunho usa `[skip ci]`, e a
  mensagem padrão do squash levaria o marcador para a branch principal.

O setup abaixo confere e ajusta isso.

## Setup do repositório

O que falta para o editor conferir cada alteração é aplicado de dois jeitos, com a mesma lógica
(`planSetup`/`applySetup` no `-common`). Só o que falta é feito, então dá para rodar de novo:

| Passo | Quando falta | Como é aplicado |
|-------|--------------|-----------------|
| `workflow` | Nenhum workflow no repositório | PR com `.github/workflows/techdocs-checks.yml` (os 4 checks, só em PRs) |
| `markdownlint` | Nenhum `.markdownlint.*` | No mesmo PR, `.markdownlint.yaml` com as regras para iniciantes |
| `merge` | Merge não é só squash com título e descrição do PR | Na hora (admin) |
| `ruleset` | A branch principal aceita mudança sem PR, ou já roda os checks padrão sem exigi-los | Na hora (admin): ruleset `techdocs-editor` com PR obrigatório e, se o workflow padrão já está na branch, os 4 checks |

- **No editor**: quem é admin do repositório vê "Configurar verificações" no painel quando falta
  algo. A confirmação diz o que muda na hora e o que vai em PR.
- **No Scaffolder**: a action `techdocs-editor:setup` (registre o módulo no backend):

  ```ts
  backend.add(import('@edtroleis/plugin-scaffolder-backend-module-techdocs-editor'));
  ```

  ```yaml
  - id: setup
    action: techdocs-editor:setup
    input:
      repoUrl: github.com?owner=my-org&repo=wiki-team
      requiredApprovals: 1   # opcional; padrão 0
  ```

  O token é o da integração do GitHub (ou `token` na entrada); sem admin, só o PR é aberto.

Pipeline própria não é trocada: o ruleset passa a exigir PR, mas não checks de nome desconhecido.

## Testes

```bash
yarn test:editor          # unitários (os dois pacotes) + editor no navegador
yarn test:editor:portal   # painel dentro da app de desenvolvimento, com o GitHub simulado (sobe a app sozinho)
```
