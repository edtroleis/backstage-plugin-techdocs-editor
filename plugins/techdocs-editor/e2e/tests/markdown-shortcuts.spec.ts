import { test } from '@playwright/test';
import { ORIGINAL, expectLintClean, expectSaved, newLineAtEnd, openEditor } from './helpers';

/**
 * Quem já sabe Markdown digita a sintaxe direto e o editor converte. Cada atalho tem de gerar o
 * Markdown esperado e passar no lint.
 */
const shortcuts = [
  { name: 'título', typed: '## Seção', markdown: '## Seção' },
  { name: 'lista', typed: '- item', markdown: '- item' },
  { name: 'lista com *', typed: '* item', markdown: '- item' },
  { name: 'lista numerada', typed: '1. item', markdown: '1. item' },
  { name: 'tarefa', typed: '- [ ] tarefa', markdown: '- [ ] tarefa' },
  { name: 'citação', typed: '> citação', markdown: '> citação' },
  { name: 'negrito', typed: 'um **forte** fim', markdown: 'um **forte** fim' },
  { name: 'itálico', typed: 'um *leve* fim', markdown: 'um *leve* fim' },
  { name: 'código no texto', typed: 'rode `npm` fim', markdown: 'rode `npm` fim' },
  { name: 'tachado', typed: 'um ~~velho~~ fim', markdown: 'um ~~velho~~ fim' },
  { name: 'linha horizontal', typed: '---', markdown: '---' },
];

for (const { name, typed, markdown } of shortcuts) {
  test(`atalho: ${name}`, async ({ page }) => {
    await openEditor(page);
    await newLineAtEnd(page);
    // ~50 letras por segundo: bem mais rápido que uma pessoa, mas dá tempo de o atalho converter o bloco
    await page.keyboard.type(typed, { delay: 20 });
    // Alguns atalhos (ex.: ---) só convertem com Enter
    if (typed === '---') await page.keyboard.press('Enter');
    await expectSaved(page, `${ORIGINAL}\n${markdown}\n`);
    await expectLintClean(page);
  });
}

test('atalho: bloco de código com ``` e linguagem', async ({ page }) => {
  await openEditor(page);
  await newLineAtEnd(page);
  await page.keyboard.type('```bash');
  await page.keyboard.press('Enter');
  await page.keyboard.type('echo oi');
  await expectSaved(page, `${ORIGINAL}\n\`\`\`bash\necho oi\n\`\`\`\n`);
  await expectLintClean(page);
});

test('atalho: link escrito em Markdown', async ({ page }) => {
  await openEditor(page);
  await newLineAtEnd(page);
  await page.keyboard.type('veja [o guia](guias/primeiros-passos.md) ');
  await expectSaved(page, `${ORIGINAL}\nveja [o guia](guias/primeiros-passos.md)\n`);
});
