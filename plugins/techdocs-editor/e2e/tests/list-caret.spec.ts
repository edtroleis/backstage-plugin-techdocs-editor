import { expect, test } from '@playwright/test';
import { expectSaved, newLineAtEnd, ORIGINAL, openEditor, slash } from './helpers';

/**
 * Digitar logo depois de criar um item de lista, com a máquina ocupada: o item do Crepe devolvia o
 * cursor para a posição de quando montou, no quadro seguinte, e as letras saíam trocadas ("oisd").
 * Aqui os quadros de animação atrasam 300 ms, como num computador lento, e a primeira letra entra
 * antes do quadro: o resto tem de continuar depois dela (listCaretFix.ts).
 */
const SLOW_FRAMES = `
  const raf = window.requestAnimationFrame.bind(window);
  const caf = window.cancelAnimationFrame.bind(window);
  const frames = new Map();
  let next = 1;
  window.requestAnimationFrame = callback => {
    const id = next++;
    const timer = setTimeout(() => frames.set(id, raf(time => { frames.delete(id); callback(time); })), 300);
    frames.set(id, { timer });
    return id;
  };
  window.cancelAnimationFrame = id => {
    const frame = frames.get(id);
    if (frame && typeof frame === 'object') clearTimeout(frame.timer);
    else if (frame) caf(frame);
    frames.delete(id);
  };
`;

const lists = [
  { label: 'Lista com marcadores', marker: '- ' },
  { label: 'Lista numerada', marker: '1. ' },
  { label: 'Lista de tarefas', marker: '- [ ] ' },
];

for (const { label, marker } of lists) {
  test(`${label}: letra digitada antes do quadro seguinte fica no lugar`, async ({ page }) => {
    await page.addInitScript(SLOW_FRAMES);
    await openEditor(page);
    await newLineAtEnd(page);
    await slash(page, label);
    await page.keyboard.type('um');
    await page.keyboard.press('Enter');
    await page.keyboard.type('d');
    // O quadro atrasado (com a devolução do cursor do Crepe) roda aqui
    await page.waitForTimeout(700);
    await page.keyboard.type('ois');
    const second = marker === '1. ' ? '2. ' : marker;
    await expectSaved(page, `${ORIGINAL}\n${marker}um\n${second}dois\n`);
  });
}

test('setas logo depois de criar o item continuam movendo o cursor', async ({ page }) => {
  await page.addInitScript(SLOW_FRAMES);
  await openEditor(page);
  await newLineAtEnd(page);
  await slash(page, 'Lista com marcadores');
  await page.keyboard.type('um');
  await page.keyboard.press('Enter');
  await page.keyboard.type('dos');
  await page.waitForTimeout(700);
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.type('i');
  await expectSaved(page, `${ORIGINAL}\n- um\n- dois\n`);
  await expect(page.locator('.milkdown .ProseMirror li')).toHaveCount(2);
});
