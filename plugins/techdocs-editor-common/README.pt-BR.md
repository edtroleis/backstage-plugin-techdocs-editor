# TechDocs Editor (common)

[English](README.md) · **Português**

Núcleo do `@edtroleis/plugin-techdocs-editor`, sem React:

- `toEditor` / `fromEditor`: Markdown do MkDocs para o editor e de volta, sem mudar o que não foi
  editado (admonitions, abas e outros blocos que o editor não conhece passam protegidos);
- `lintFindings` / `fixLintProblems`: o markdownlint com a configuração do repositório;
- `merge3`: merge de 3 vias por linha, como o do Git, com os trechos em conflito;
- `GitHubClient`: as chamadas à API do GitHub que o editor usa (arquivos, branches, PRs, checks);
- `loadSession`, `syncWithMain`: sessão de edição de uma página e sincronização do rascunho com a
  versão publicada.

Usado pelo plugin; não precisa ser instalado à parte.
