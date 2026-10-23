import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

/** Páginas usadas nos cenários de edição: as da wiki de exemplo (cópia fixa em portal/wiki-fixture) e uma bem completa. */

const WIKI_DOCS = join(__dirname, '../portal/wiki-fixture/docs');

function markdownFiles(dir: string): string[] {
  return readdirSync(dir).flatMap(name => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return path.endsWith('.md') ? [path] : [];
  });
}

/** Página com tudo o que as docs usam: admonition, abas, tabela, listas, código, imagem, linha. */
export const RICH_PAGE = `# Primeiros passos

Bem-vindo à wiki.

!!! tip "Dica"
    Use o botão **Editar esta página**.

    Segundo parágrafo da dica.

=== "Linux"

    \`\`\`bash
    ./instalar.sh
    \`\`\`

=== "Windows"

    Rode o instalador.

## Tabela de exemplo

| Coluna | Outra |
| ------ | ----- |
| a      | b     |

## Listas

- um
- dois

1. primeiro
2. segundo

## Código

\`\`\`yaml
chave: valor
\`\`\`

---

Fim com [outra página](outra.md) e ![imagem](assets/foto.png).
`;

export type TestPage = { name: string; markdown: string };

export const PAGES: TestPage[] = [
  ...markdownFiles(WIKI_DOCS).map(path => ({
    name: `wiki: ${relative(WIKI_DOCS, path)}`,
    markdown: readFileSync(path, 'utf8'),
  })),
  { name: 'página completa', markdown: RICH_PAGE },
];
