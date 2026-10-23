import { EMPTY_REPO_CONFIG, parseRepoConfig } from './repoConfig';

describe('.techdocs-editor.yaml', () => {
  it('lê o modo, o tempo para começar e as mensagens dos checks', () => {
    const config = parseRepoConfig(`
verification:
  mode: pipeline
  startTimeoutSeconds: 600
  checkHelp:
    build: A documentação não pôde ser montada.
    'Verificação de links': Há links que não funcionam.
`);
    expect(config).toEqual({
      verification: {
        mode: 'pipeline',
        startTimeoutSeconds: 600,
        checkHelp: {
          build: 'A documentação não pôde ser montada.',
          'Verificação de links': 'Há links que não funcionam.',
        },
      },
    });
  });

  it('ignora campos inválidos (vale o do portal) sem travar o editor', () => {
    const config = parseRepoConfig(`
verification:
  mode: jenkins
  startTimeoutSeconds: -5
  checkHelp:
    build: 3
    lint: Formatação fora do padrão.
`);
    expect(config.verification).toEqual({ mode: undefined, startTimeoutSeconds: undefined, checkHelp: { lint: 'Formatação fora do padrão.' } });
  });

  it('YAML que não abre, vazio ou sem verification: configuração vazia', () => {
    expect(parseRepoConfig('verification: [')).toEqual(EMPTY_REPO_CONFIG);
    expect(parseRepoConfig('')).toEqual(EMPTY_REPO_CONFIG);
    expect(parseRepoConfig('outra: coisa')).toEqual(EMPTY_REPO_CONFIG);
    expect(parseRepoConfig('verification: texto')).toEqual(EMPTY_REPO_CONFIG);
  });
});
