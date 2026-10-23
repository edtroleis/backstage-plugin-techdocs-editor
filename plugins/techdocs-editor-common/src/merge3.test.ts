import { conflictCount, merge3, resolveChunks } from './merge3';

const doc = (...lines: string[]) => `${lines.join('\n')}\n`;
const BASE = doc('# Título', '', 'Parágrafo um.', '', 'Parágrafo dois.', '', 'Parágrafo três.');

/** Texto da fusão quando não há conflito. */
const merged = (base: string, mine: string, theirs: string) => {
  const chunks = merge3(base, mine, theirs);
  expect(conflictCount(chunks)).toBe(0);
  return resolveChunks(chunks, []);
};

describe('merge3', () => {
  it('só um lado mudou: fica a mudança', () => {
    const mine = BASE.replace('um.', 'um, editado.');
    expect(merged(BASE, mine, BASE)).toBe(mine);
    expect(merged(BASE, BASE, mine)).toBe(mine);
  });

  it('trechos separados: entram as duas alterações', () => {
    const mine = BASE.replace('um.', 'um (meu).');
    const theirs = BASE.replace('três.', 'três (publicado).');
    expect(merged(BASE, mine, theirs)).toBe(
      doc('# Título', '', 'Parágrafo um (meu).', '', 'Parágrafo dois.', '', 'Parágrafo três (publicado).'),
    );
  });

  it('a mesma alteração dos dois lados não é conflito', () => {
    const both = BASE.replace('dois.', 'dois!');
    expect(merged(BASE, both, both)).toBe(both);
  });

  it('linhas acrescentadas em pontos diferentes', () => {
    const mine = BASE.replace('# Título\n', '# Título\n\nIntrodução nova.\n');
    const theirs = `${BASE}\nFim novo.\n`;
    expect(merged(BASE, mine, theirs)).toBe(`${mine}\nFim novo.\n`);
  });

  it('mesma linha alterada dos dois lados: conflito com as duas versões', () => {
    const mine = BASE.replace('dois.', 'dois, versão minha.');
    const theirs = BASE.replace('dois.', 'dois, versão publicada.');
    const chunks = merge3(BASE, mine, theirs);
    expect(conflictCount(chunks)).toBe(1);
    expect(chunks.find(c => c.kind === 'conflict')).toEqual({
      kind: 'conflict',
      mine: ['Parágrafo dois, versão minha.'],
      theirs: ['Parágrafo dois, versão publicada.'],
    });
    expect(resolveChunks(chunks, ['mine'])).toBe(mine);
    expect(resolveChunks(chunks, ['theirs'])).toBe(theirs);
    expect(resolveChunks(chunks, ['both'])).toBe(
      BASE.replace('dois.', 'dois, versão publicada.\nParágrafo dois, versão minha.'),
    );
  });

  it('linhas vizinhas alteradas dos dois lados também são conflito (como no Git)', () => {
    const base = doc('a', 'b', 'c');
    expect(conflictCount(merge3(base, doc('a', 'B', 'c'), doc('a', 'b', 'C')))).toBe(1);
  });

  it('um lado apaga o trecho que o outro alterou: conflito, com a remoção como opção', () => {
    const mine = BASE.replace('Parágrafo dois.\n\n', '');
    const theirs = BASE.replace('dois.', 'dois, revisado.');
    const chunks = merge3(BASE, mine, theirs);
    expect(conflictCount(chunks)).toBe(1);
    expect(resolveChunks(chunks, ['mine'])).toBe(mine);
    expect(resolveChunks(chunks, ['theirs'])).toBe(theirs);
  });

  it('vários conflitos: cada um com a sua escolha, na ordem', () => {
    const mine = BASE.replace('um.', 'um M.').replace('três.', 'três M.');
    const theirs = BASE.replace('um.', 'um T.').replace('três.', 'três T.');
    const chunks = merge3(BASE, mine, theirs);
    expect(conflictCount(chunks)).toBe(2);
    expect(resolveChunks(chunks, ['theirs', 'mine'])).toBe(BASE.replace('um.', 'um T.').replace('três.', 'três M.'));
  });

  it('arquivo novo dos dois lados (sem versão comum)', () => {
    const chunks = merge3('', doc('meu'), doc('publicado'));
    expect(conflictCount(chunks)).toBe(1);
    expect(resolveChunks(chunks, ['mine'])).toBe(doc('meu'));
  });
});
