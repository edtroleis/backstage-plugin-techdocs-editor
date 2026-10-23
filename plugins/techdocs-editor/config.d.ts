export interface Config {
  /** Editor visual de docs (@edtroleis/plugin-techdocs-editor). Tudo é opcional. */
  techdocsEditor?: {
    github?: {
      /**
       * Como o editor fala com o GitHub:
       * - user (padrão): com o token do próprio usuário, pelo login do GitHub do Backstage. O GitHub
       *   decide quem pode escrever. Use em PoC e produção.
       * - proxy: pelo proxy do backend (endpoint `techdocs-editor-github`), com a conta do servidor.
       *   Só para demonstração: todo mundo escreve com a mesma conta (o editor avisa na tela).
       * @visibility frontend
       */
      auth?: 'user' | 'proxy';
      /**
       * Host do GitHub quando a documentação não informa (`backstage.io/source-location`). A URL da
       * API vem da integração desse host (`integrations.github`), então GitHub Enterprise funciona.
       * Padrão: github.com.
       * @visibility frontend
       */
      host?: string;
      /**
       * Escopos do OAuth pedidos no login do GitHub. Padrão: ["repo"] (repositórios privados).
       * Para wikis só em repositórios públicos, ["public_repo"] basta.
       * @visibility frontend
       */
      scopes?: string[];
    };
    /**
     * Nome da branch do rascunho. `{login}`: login do GitHub; `{path}`: arquivo sem `.md`.
     * Padrão: "docs/{login}/{path}".
     * @visibility frontend
     */
    branchPattern?: string;
    drafts?: {
      /**
       * "Salvar rascunho" põe `[skip ci]` no commit para não rodar a pipeline. Padrão: true.
       * @visibility frontend
       */
      skipCi?: boolean;
    };
    verification?: {
      /**
       * O que "Salvar e verificar" confere:
       * - auto (padrão): a pipeline, se o repositório tiver workflows; senão, só o lint do editor;
       * - pipeline: sempre os checks do GitHub;
       * - editor: só o lint do editor (repositórios sem pipeline).
       * Uma documentação pode escolher com a anotação `techdocs-editor/verification`.
       * @visibility frontend
       */
      mode?: 'auto' | 'pipeline' | 'editor';
      /**
       * Mensagem em linguagem simples para cada check que falhar, pelo nome do job.
       * Ex.: { "Links": "Há links que não funcionam." }
       * @deepVisibility frontend
       */
      checkHelp?: { [checkName: string]: string };
      /**
       * Segundos sem nenhum check começar até o painel avisar que o GitHub não iniciou as
       * verificações. Padrão: 120.
       * @visibility frontend
       */
      startTimeoutSeconds?: number;
    };
    images?: {
      /**
       * Tamanho máximo, em MB, de uma imagem enviada pelo editor (vai para o repositório). Padrão: 5.
       * @visibility frontend
       */
      maxSizeMB?: number;
    };
    polling?: {
      /**
       * Intervalo, em segundos, das consultas ao GitHub enquanto há verificação rodando ou PR esperando
       * publicação. Padrão: 8.
       * @visibility frontend
       */
      intervalSeconds?: number;
      /**
       * Intervalo, em segundos, com tudo parado (verificações terminadas) e para conferir se outra pessoa
       * publicou a página. Com a aba em segundo plano, nada é consultado. Padrão: 60.
       * @visibility frontend
       */
      idleIntervalSeconds?: number;
    };
  };
}
