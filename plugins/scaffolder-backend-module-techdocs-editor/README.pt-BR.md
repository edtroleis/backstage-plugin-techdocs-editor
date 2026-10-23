# techdocs-editor:setup

[English](README.md) · **Português**

Módulo do Scaffolder com a action `techdocs-editor:setup`: prepara um repositório de documentação
para o editor do TechDocs. Só aplica o que falta, então pode rodar de novo.

- Merge só por squash, com título e descrição do PR, e ruleset da branch principal (PR obrigatório
  e, se o workflow padrão já está lá, os 4 checks): na hora. O token precisa ser admin.
- Workflow de verificações e `.markdownlint.yaml`, se faltarem: num PR da branch
  `techdocs-editor/setup`.

```ts
// packages/backend/src/index.ts
backend.add(import('@edtroleis/plugin-scaffolder-backend-module-techdocs-editor'));
```

```yaml
steps:
  - id: setup
    action: techdocs-editor:setup
    input:
      repoUrl: github.com?owner=my-org&repo=wiki-team
      requiredApprovals: 1 # opcional; padrão 0
```

Saídas: `applied` (o que mudou: `workflow`, `markdownlint`, `merge`, `ruleset`) e
`pullRequestUrl` (quando abriu PR). A lógica fica em `@edtroleis/plugin-techdocs-editor-common`
(`planSetup`/`applySetup`), a mesma do botão "Configurar verificações" do editor. Mais detalhes no
[README do plugin](../techdocs-editor/README.pt-BR.md#setup-do-repositório).
