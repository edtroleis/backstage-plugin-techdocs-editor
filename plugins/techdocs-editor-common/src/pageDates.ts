/**
 * Datas da página publicadas pelo plugin git-revision-date-localized do MkDocs, lidas do HTML do
 * TechDocs e mostradas sempre como "22/10/2026 12:35:27", seja qual for o `type` do plugin na wiki.
 */

export type PageDates = { updated?: string; created?: string };

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, março: 3, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

const pad = (n: string | number) => String(n).padStart(2, '0');

const build = (day: string | number, month: string | number, year: string, time: string[]) => {
  const [h, min, sec] = time;
  const date = `${pad(day)}/${pad(month)}/${year}`;
  return h ? `${date} ${pad(h)}:${min}:${sec ?? '00'}` : date;
};

/** Converte o texto publicado para "dd/mm/aaaa hh:mm:ss"; formato desconhecido volta como veio. */
export function formatPageDate(text: string): string {
  const t = text.trim();
  const time = '(?:[ T](\\d{1,2}):(\\d{2})(?::(\\d{2}))?)?';
  // custom "%d/%m/%Y %H:%M:%S"
  let m = t.match(new RegExp(`^(\\d{1,2})/(\\d{1,2})/(\\d{4})${time}`));
  if (m) return build(m[1], m[2], m[3], m.slice(4));
  // iso_date / iso_datetime
  m = t.match(new RegExp(`^(\\d{4})-(\\d{2})-(\\d{2})${time}`));
  if (m) return build(m[3], m[2], m[1], m.slice(4));
  // date / datetime com locale pt: "22 de outubro de 2026 12:35:27"
  m = t.match(new RegExp(`^(\\d{1,2}) de (\\p{L}+) de (\\d{4})${time.replace('[ T]', '\\s+')}`, 'u'));
  const month = m && MONTHS[m[2].toLowerCase()];
  if (m && month) return build(m[1], month, m[3], m.slice(4));
  return t;
}

/**
 * Lê as datas do rodapé do tema (`aside.md-source-file`). Cada data vem num `.md-source-file__fact`,
 * com o rótulo no `title` do ícone; sem rótulo conhecido, vale a ordem do tema (atualização, criação).
 */
export function readPageDates(root: ParentNode): PageDates {
  const facts = [...root.querySelectorAll('.md-source-file__fact')]
    .map(fact => ({
      label: fact.querySelector('.md-icon')?.getAttribute('title') ?? '',
      text: fact.querySelector('.git-revision-date-localized-plugin')?.textContent ?? '',
    }))
    .filter(f => f.text.trim());
  const byLabel = (pattern: RegExp) => facts.find(f => pattern.test(f.label))?.text;
  const updated = byLabel(/atualiza|updated/i) ?? facts[0]?.text;
  const created = byLabel(/criad|created/i) ?? (facts.length > 1 ? facts[1].text : undefined);
  return {
    updated: updated && formatPageDate(updated),
    created: created && formatPageDate(created),
  };
}
