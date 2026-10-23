import { formatPageDate, readPageDates } from './pageDates';

describe('formatPageDate', () => {
  it.each([
    ['22/10/2026 12:35:27', '22/10/2026 12:35:27'],
    ['2/9/2026 8:05', '02/09/2026 08:05:00'],
    ['2026-10-22 12:35:27', '22/10/2026 12:35:27'],
    ['2026-10-22', '22/10/2026'],
    ['22 de outubro de 2026 12:35:27', '22/10/2026 12:35:27'],
    ['1 de março de 2026', '01/03/2026'],
    ['há 3 dias', 'há 3 dias'],
  ])('%s → %s', (text, expected) => {
    expect(formatPageDate(text)).toBe(expected);
  });
});

describe('readPageDates', () => {
  const fact = (title: string, text: string) =>
    `<span class="md-source-file__fact"><span class="md-icon" title="${title}"></span>` +
    `<span class="git-revision-date-localized-plugin">${text}</span></span>`;
  const aside = (html: string) => {
    const root = document.createElement('div');
    root.innerHTML = `<aside class="md-source-file">${html}</aside>`;
    return root;
  };

  it('usa os rótulos do tema', () => {
    const root = aside(fact('Criado em', '21 de outubro de 2026 23:02:04') + fact('Última atualização', '2026-10-22 12:35:27'));
    expect(readPageDates(root)).toEqual({ updated: '22/10/2026 12:35:27', created: '21/10/2026 23:02:04' });
  });

  it('sem rótulo conhecido, vale a ordem do tema', () => {
    const root = aside(fact('Last update', '22/10/2026 12:35:27') + fact('Created', '21/10/2026 23:02:04'));
    expect(readPageDates(root)).toEqual({ updated: '22/10/2026 12:35:27', created: '21/10/2026 23:02:04' });
  });

  it('página sem datas', () => {
    expect(readPageDates(aside(''))).toEqual({ updated: undefined, created: undefined });
  });
});
