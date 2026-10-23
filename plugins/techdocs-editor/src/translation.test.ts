import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { enMessages } from './translation';
import ptBR from './translations/pt-BR';

/** { a: { b: 'x' } } → { 'a.b': 'x' } */
function flatten(obj: object, prefix = ''): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).flatMap(([k, v]) =>
      typeof v === 'string' ? [[`${prefix}${k}`, v]] : Object.entries(flatten(v, `${prefix}${k}.`)),
    ),
  );
}

const en = flatten(enMessages);
const pt: Record<string, string> = ptBR;
const variables = (text: string) => [...text.matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort();

describe('tradução', () => {
  it('inglês e português têm as mesmas chaves', () => {
    expect(Object.keys(pt).sort()).toEqual(Object.keys(en).sort());
  });

  it('as mesmas variáveis ({{nome}}) nos dois idiomas', () => {
    const differ = Object.keys(en).filter(k => variables(en[k]).join() !== variables(pt[k] ?? '').join());
    expect(differ).toEqual([]);
  });

  it('toda chave usada no código existe (com ou sem plural)', () => {
    const source = readdirSync(__dirname)
      .filter(f => /\.tsx?$/.test(f) && !f.endsWith('.test.ts'))
      .map(f => readFileSync(join(__dirname, f), 'utf8'))
      .join('\n');
    // t('chave'…), t(cond ? 'chave' : 'chave'…) e chaves passadas a funções que montam textos
    const used = new Set([...source.matchAll(/'((?:page|docsList|editor|notices|confirm|errors|git|panel|conflict|history|search|addon)\.[\w.]+)'/g)].map(m => m[1]));
    const missing = [...used].filter(k => !(k in en) && !(`${k}_one` in en && `${k}_other` in en));
    expect(missing).toEqual([]);
    expect(used.size).toBeGreaterThan(100);
  });
});
