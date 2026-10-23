import { ReactNode, Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Content, Link, Progress, WarningPanel } from '@backstage/core-components';
import { Header } from '@backstage/ui';
import { parseEntityRef } from '@backstage/catalog-model';
import { usePermission } from '@backstage/plugin-permission-react';
import { Button, Grid, Paper, makeStyles } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import SearchIcon from '@material-ui/icons/Search';
import HistoryIcon from '@material-ui/icons/History';
import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import {
  OpenPullRequest,
  parseAnnotation,
  summarize,
  toEditor,
  techdocsEditorEditPermission,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useGitHubConnector } from './connect';
import type { MarkdownEditorHandle } from './MarkdownEditor';
import type { MarkdownSourceHandle, SourceProblem } from './MarkdownSource';
import { PublishPanel } from './PublishPanel';
import { DocsToEdit } from './DocsToEdit';
import { ConflictResolver } from './ConflictResolver';
import { HistoryDialog } from './HistoryDialog';
import { checkHelpFor, useEditorConfig, verificationFor } from './config';
import { useEditorTranslation } from './useEditorTranslation';
import { SearchBar, useVisualSearch } from './SearchBar';
import { EditorNotices } from './EditorNotices';
import { titleOf } from './editorUtils';
import { LoadedEditor, useEditorSession } from './useEditorSession';
import { useRepoSetup } from './useRepoSetup';
import { SetupNotice } from './SetupNotice';
import { EditorMode, useEditorDocument } from './useEditorDocument';
import { usePublishFlow } from './usePublishFlow';

// Milkdown e CodeMirror são grandes: baixados só quando aparecem (a lista de docs não usa nenhum dos
// dois, e a visão Markdown só abre quando a pessoa pede)
const MarkdownEditor = lazy(() => import('./MarkdownEditor').then(m => ({ default: m.MarkdownEditor })));
const MarkdownSource = lazy(() => import('./MarkdownSource').then(m => ({ default: m.MarkdownSource })));

const useStyles = makeStyles(theme => ({
  editor: { padding: theme.spacing(1, 2), minHeight: 480 },
  // A visão Markdown tem fundo e margens próprios (tema do VS Code)
  source: { overflow: 'hidden', backgroundColor: '#1e1e1e' },
  modeBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  back: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
    fontWeight: 600,
  },
}));

/** Endereço da página no TechDocs. */
const docsUrlOf = (entityRef: string, page: string) => {
  const { kind, namespace, name } = parseEntityRef(entityRef || 'component:default/unknown');
  return `/docs/${namespace}/${kind}/${name}/${page}`.toLowerCase();
};

type WorkspaceProps = {
  loaded: LoadedEditor;
  othersPrs: OpenPullRequest[];
  docsUrl: string;
  /** Título da documentação. */
  title: string;
};

/** Editor aberto: texto (visual ou Markdown), avisos e o painel de publicação. */
const EditorWorkspace = ({ loaded, othersPrs, docsUrl, title }: WorkspaceProps) => {
  const classes = useStyles();
  const { entity, client, session, editedBy } = loaded;
  const { proxyMode } = useGitHubConnector();
  const config = useEditorConfig();
  const { t, ruleText, editorText, phrases } = useEditorTranslation();
  const [historyOpen, setHistoryOpen] = useState(false);
  const doc = useEditorDocument(loaded);
  const flow = usePublishFlow({ loaded, doc, docsUrl, closeHistory: () => setHistoryOpen(false) });
  const setup = useRepoSetup(loaded);
  const { mode, pending } = doc;
  const [jumpTo, setJumpTo] = useState<number>();
  const sourceRef = useRef<MarkdownSourceHandle>(null);
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const search = useVisualSearch(editorRef);

  const openSearch = () => {
    if (mode === 'markdown') sourceRef.current?.openSearch();
    else search.show();
  };

  const switchMode = (next: EditorMode) => {
    if (next !== mode) search.close();
    doc.switchMode(next);
  };

  // A visão Markdown mostra o arquivo como vai para o repositório; o editor guarda o formato dele
  const onSourceChange = (text: string) => doc.onChange(toEditor(text));

  /** Abre a visão Markdown na linha apontada pela pipeline. */
  const showLine = (line: number) => {
    if (mode === 'markdown') {
      sourceRef.current?.goToLine(line);
    } else {
      setJumpTo(line);
      switchMode('markdown');
    }
  };

  // A visão Markdown é baixada só na primeira vez que abre: vai para a linha quando ela avisar que existe
  const [sourceReady, setSourceReady] = useState(0);
  useEffect(() => {
    if (mode === 'markdown' && jumpTo && sourceRef.current) {
      sourceRef.current.goToLine(jumpTo);
      setJumpTo(undefined);
    }
  }, [mode, jumpTo, sourceReady]);

  /** "Resolver conflito": abre a tela de escolha no lugar do editor. */
  const onResolve = () => {
    search.close();
    flow.setResolving(true);
  };

  // Problemas da pipeline neste arquivo (linhas da versão salva), marcados nos dois modos
  const { annotations, lintProblems } = flow;
  const pipelineProblems = useMemo<SourceProblem[]>(
    () =>
      Object.values(annotations)
        .flat()
        .filter(a => a.path === session.filePath)
        .map(a => {
          const { rule, description } = parseAnnotation(a);
          return { line: a.line, message: ruleText(rule, description) };
        }),
    [annotations, session.filePath, ruleText],
  );
  const problemLines = useMemo(() => pipelineProblems.map(p => p.line), [pipelineProblems]);
  // Na visão Markdown, também os do lint local (linhas do texto como vai ser salvo)
  const problems = useMemo<SourceProblem[]>(
    () => [...pipelineProblems, ...lintProblems.map(p => ({ line: p.line, message: ruleText(p.rule, p.message) }))],
    [pipelineProblems, lintProblems, ruleText],
  );

  // PR da própria pessoa aberto fora do editor (outra branch). No modo proxy o autor é sempre a conta
  // do servidor, então lá não dá para saber de quem é: todos ficam como de outras pessoas
  const isOwn = (p: OpenPullRequest) => !proxyMode && p.author === session.login;
  const ownPrs = othersPrs.filter(isOwn);
  const otherPeoplePrs = othersPrs.filter(p => !isOwn(p));

  return (
    <>
      <Header
        title={t('editor.editingTitle', { title: titleOf(doc.initialValue, session.filePath) })}
        description={title}
        customActions={
          <Link to={docsUrl} className={classes.back}>
            <ArrowBackIcon fontSize="small" />
            {t('editor.back')}
          </Link>
        }
      />
      <Content>
        <EditorNotices
          proxyMode={proxyMode}
          editedBy={editedBy}
          ownPrs={ownPrs}
          otherPeoplePrs={otherPeoplePrs}
          showConflict={Boolean(flow.conflict) && !flow.resolving}
          dirty={pending !== undefined}
          busy={flow.busy}
          onResolve={onResolve}
          restored={doc.restored}
          notice={flow.notice}
          onCloseNotice={() => flow.setNotice(undefined)}
          error={flow.actionError}
          onCloseError={() => flow.setActionError(undefined)}
        />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {flow.resolving && flow.conflict ? (
              <Paper>
                <ConflictResolver
                  chunks={flow.conflict.chunks}
                  busy={flow.busy}
                  onDone={flow.onResolved}
                  onCancel={() => flow.setResolving(false)}
                />
              </Paper>
            ) : (
              <>
                <div className={classes.modeBar}>
                  {mode === 'markdown' && (
                    <>
                      <Button size="small" startIcon={<UndoIcon />} onClick={() => sourceRef.current?.undo()}>
                        {t('editor.undo')}
                      </Button>
                      <Button size="small" startIcon={<RedoIcon />} onClick={() => sourceRef.current?.redo()}>
                        {t('editor.redo')}
                      </Button>
                    </>
                  )}
                  <Button size="small" startIcon={<HistoryIcon />} onClick={() => setHistoryOpen(true)}>
                    {t('editor.history')}
                  </Button>
                  <Button size="small" startIcon={<SearchIcon />} onClick={openSearch}>
                    {t('editor.search')}
                  </Button>
                  <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={mode}
                    onChange={(_, next: EditorMode | null) => next && switchMode(next)}
                  >
                    <ToggleButton value="visual">{t('editor.visual')}</ToggleButton>
                    <ToggleButton value="markdown">{t('editor.markdown')}</ToggleButton>
                  </ToggleButtonGroup>
                </div>
                {mode === 'visual' && search.open && (
                  <SearchBar
                    query={search.query}
                    result={search.result}
                    run={search.run}
                    move={search.move}
                    close={search.close}
                  />
                )}
                <Paper
                  className={mode === 'visual' ? classes.editor : classes.source}
                  onKeyDown={e => {
                    // Ctrl+F no modo visual abre a busca do editor (no Markdown, a busca é a do próprio editor)
                    if (mode === 'visual' && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                      e.preventDefault();
                      openSearch();
                    }
                  }}
                >
                  <Suspense fallback={<Progress />}>
                    {mode === 'visual' ? (
                      <MarkdownEditor
                        ref={editorRef}
                        key={doc.editorKey}
                        initialValue={doc.initialValue}
                        onChange={doc.onChange}
                        onUploadImage={flow.uploadImage}
                        resolveImage={flow.resolveImage}
                        problemLines={problemLines}
                        showsSavedVersion={pending === undefined}
                        text={editorText}
                      />
                    ) : (
                      <MarkdownSource
                        ref={sourceRef}
                        initialValue={doc.sourceValue}
                        onChange={onSourceChange}
                        problems={problems}
                        phrases={phrases}
                        onReady={() => setSourceReady(n => n + 1)}
                      />
                    )}
                  </Suspense>
                </Paper>
              </>
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <PublishPanel
              verification={verificationFor(entity, config, session)}
              checkHelp={checkHelpFor(config, session)}
              stalled={flow.stalled}
              pr={flow.pr}
              checks={flow.checks}
              checksSummary={summarize(flow.checks)}
              annotations={annotations}
              pollError={flow.pollError}
              requiredApprovals={session.requiredApprovals}
              dirty={pending !== undefined}
              hasDraft={flow.hasBranch}
              unverified={flow.unverified}
              conflict={Boolean(flow.conflict)}
              lintProblems={lintProblems}
              onFixLint={flow.fixLint}
              busy={flow.busy}
              docsUrl={docsUrl}
              onSaveDraft={flow.onSaveDraft}
              onVerify={flow.onVerify}
              onSend={flow.onSend}
              onDiscard={flow.onDiscard}
              onShowLine={showLine}
            />
            <SetupNotice setup={setup} />
          </Grid>
        </Grid>
        <HistoryDialog
          open={historyOpen}
          client={client}
          filePath={session.filePath}
          branch={session.repo.defaultBranch}
          busy={flow.busy}
          onRestore={flow.onRestore}
          onClose={() => setHistoryOpen(false)}
        />
      </Content>
    </>
  );
};

/**
 * Editor visual de uma página do TechDocs.
 * URL: /docs-editor?entity=<ref da entidade>&page=<caminho da página no TechDocs>
 */
const PageEditor = () => {
  const [params] = useSearchParams();
  const entityRef = params.get('entity') ?? '';
  const page = params.get('page') ?? '';
  const { t } = useEditorTranslation();
  // Permissão do Backstage para editar esta documentação (a escrita ainda depende do GitHub)
  const editPermission = usePermission({
    permission: techdocsEditorEditPermission,
    resourceRef: entityRef || undefined,
  });
  const { loaded, loadError, othersPrs } = useEditorSession(entityRef, page);
  const docsUrl = docsUrlOf(entityRef, page);
  const title = loaded?.entity.metadata.title ?? parseEntityRef(entityRef || 'component:default/unknown').name;

  // Mesmo layout das páginas do Backstage: título e ações no Header do @backstage/ui
  const notice = (body: ReactNode) => (
    <>
      <Header title={t('docsList.title')} description={title} />
      <Content>{body}</Content>
    </>
  );

  if (loadError) {
    // Aberto: o motivo é o que a pessoa precisa ler (recolhido, só aparecia o título)
    return notice(<WarningPanel severity="error" title={t('editor.loadError')} message={loadError} defaultExpanded />);
  }
  if (!editPermission.loading && !editPermission.allowed) {
    return notice(
      <WarningPanel
        defaultExpanded
        severity="info"
        title={t('editor.noPermissionTitle')}
        message={
          <>
            {t('editor.noPortalPermission')} <Link to={docsUrl}>{t('editor.back')}</Link>
          </>
        }
      />,
    );
  }
  if (!loaded) return notice(<Progress />);
  if (!loaded.session.repo.canWrite) {
    const owner = (loaded.entity.spec?.owner as string | undefined) ?? t('editor.ownerFallback');
    return notice(
      <WarningPanel
        defaultExpanded
        severity="info"
        title={t('editor.noPermissionTitle')}
        message={
          <>
            {t('editor.noGitHubPermission', { owner: <strong>{owner}</strong> })}{' '}
            <Link to={docsUrl}>{t('editor.back')}</Link>
          </>
        }
      />,
    );
  }
  return <EditorWorkspace key={loaded.id} loaded={loaded} othersPrs={othersPrs} docsUrl={docsUrl} title={title} />;
};

/**
 * /docs-editor: sem ?entity (ex.: pela faixa do plugin ou pelo menu), lista as documentações;
 * com ?entity, abre o editor da página.
 */
export const EditorPage = () => {
  const [params] = useSearchParams();
  return params.get('entity') ? <PageEditor /> : <DocsToEdit />;
};
