import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { RELATION_OWNED_BY, stringifyEntityRef } from '@backstage/catalog-model';
import { identityApiRef, useApi, useRouteRef } from '@backstage/core-plugin-api';
import { catalogApiRef, getEntityRelations } from '@backstage/plugin-catalog-react';
import { usePermission } from '@backstage/plugin-permission-react';
import { useTechDocsReaderPage } from '@backstage/plugin-techdocs-react';
import { Badge, IconButton, Link, Tooltip, Typography, makeStyles } from '@material-ui/core';
import CallMergeIcon from '@material-ui/icons/CallMerge';
import EditIcon from '@material-ui/icons/Edit';
import { rootRouteRef } from './routes';
import { useGitHubConnector } from './connect';
import { useEditorConfig } from './config';
import { useEditorTranslation } from './useEditorTranslation';
import {
  branchFor,
  findPageFile,
  type OpenPullRequest,
  PageDates as Dates,
  readPageDates,
  repoHost,
  repoSlug,
  techdocsEditorEditPermission,
} from '@edtroleis/plugin-techdocs-editor-common';

const HIDE_THEME_ICONS_ID = 'docs-editor-hide-theme-icons';

/**
 * Esconde o "¶" (link permanente) que o tema do MkDocs põe ao lado dos títulos (o techdocs-core força
 * essa opção) e os ícones "editar/ver no GitHub" (vêm do repo_url): o único jeito de editar é o lápis.
 * As datas do rodapé (git-revision-date-localized) também saem: vão para o alto da página (PageDates).
 * Vale para todas as wikis sem mexer no mkdocs.yml; a doc é renderizada num shadow DOM.
 */
function hideThemeExtras(shadowRoot: ShadowRoot) {
  if (shadowRoot.getElementById(HIDE_THEME_ICONS_ID)) return;
  const style = document.createElement('style');
  style.id = HIDE_THEME_ICONS_ID;
  style.textContent = `
    .md-typeset .headerlink, .md-content__button { display: none !important; }
    .md-source-file { display: none !important; }
  `;
  shadowRoot.appendChild(style);
}

type PendingChanges = {
  /** Lista de PRs do repositório no GitHub (github.com ou Enterprise). */
  pullsUrl: string;
  /** PRs abertos que alteram a página, sem o rascunho da própria pessoa */
  list: OpenPullRequest[];
  /** A pessoa tem um rascunho desta página (branch sem PR, ou com PR ainda em draft) */
  hasDraft: boolean;
};

type EditAccess = {
  /** Mostra o lápis: a pessoa pode editar esta documentação */
  canEdit: boolean;
  /** Alterações pendentes da página (só com login do GitHub e permissão de escrita) */
  pending?: PendingChanges;
};

/**
 * Quem pode editar a página e o que está pendente nela. Antes de tudo, a permissão do Backstage
 * (`techdocs-editor.page.edit`). Com login do GitHub já feito, vale a
 * permissão de escrita no repositório (spec 01); sem login, não dá para perguntar ao GitHub sem abrir
 * o popup, então vale ser owner da documentação no catálogo (o owner é o time do RBAC no GitHub).
 * Pendências: PRs abertos (o texto publicado não é a última versão) e o rascunho da própria pessoa.
 */
function useEditAccess(entityRef: string, page: string) {
  const catalogApi = useApi(catalogApiRef);
  const identityApi = useApi(identityApiRef);
  const { connect } = useGitHubConnector();
  const { branchPattern } = useEditorConfig();
  const [access, setAccess] = useState<EditAccess>({ canEdit: false });
  // Permissão do Backstage (política do portal); o GitHub decide a escrita. Os dois precisam permitir
  const { allowed } = usePermission({ permission: techdocsEditorEditPermission, resourceRef: entityRef });

  useEffect(() => {
    let cancelled = false;
    const update = (next: EditAccess) => !cancelled && setAccess(next);
    (async () => {
      const entity = await catalogApi.getEntityByRef(entityRef);
      const slug = entity && repoSlug(entity);
      if (!entity || !slug) return;
      const gh = await connect(slug, { optional: true, host: repoHost(entity) });
      if (!gh) {
        const { ownershipEntityRefs } = await identityApi.getBackstageIdentity();
        const owners = getEntityRelations(entity, RELATION_OWNED_BY).map(o => stringifyEntityRef(o));
        update({ canEdit: owners.some(o => ownershipEntityRefs.includes(o)) });
        return;
      }
      const repo = await gh.getRepo();
      update({ canEdit: repo.canWrite });
      if (!repo.canWrite) return;
      const [{ filePath }, login] = await Promise.all([
        findPageFile(gh, entity, page, repo.defaultBranch),
        gh.getLogin(),
      ]);
      const branch = branchFor(login, filePath, branchPattern);
      const [all, branchSha] = await Promise.all([
        gh.findOpenPullRequestsForFile(filePath),
        gh.getBranchSha(branch),
      ]);
      const own = all.find(p => p.branch === branch);
      // PR da pessoa já enviado continua na lista (aguarda publicação); em draft, é o rascunho
      const hasDraft = Boolean(branchSha) && (!own || own.draft);
      const list = all.filter(p => !(p.branch === branch && p.draft));
      update({ canEdit: true, pending: { pullsUrl: `${repo.htmlUrl}/pulls`, list, hasDraft } });
      // Falha ao consultar: mostra o lápis (o editor confere a permissão de novo ao abrir)
    })().catch(() => update({ canEdit: true }));
    return () => {
      cancelled = true;
    };
  }, [catalogApi, identityApi, connect, entityRef, page, branchPattern]);

  return allowed ? access : { canEdit: false };
}

/** Ícone com o número de PRs abertos da página; a dica lista os links. */
const OpenPullRequests = ({ pullsUrl, list }: { pullsUrl: string; list: OpenPullRequest[] }) => {
  const { t } = useEditorTranslation();
  const label = t('addon.pending', { count: list.length });
  return (
    <Tooltip
      interactive
      title={
        <>
          {label}:
          {list.map(p => (
            <div key={p.number}>
              <Link href={p.htmlUrl} target="_blank" rel="noopener" color="inherit" underline="always">
                {t('notices.pullRequestLink', { number: String(p.number) })}
              </Link>
              {p.author && ` (${p.author})`}
            </div>
          ))}
        </>
      }
    >
      <IconButton
        component="a"
        href={list.length === 1 ? list[0].htmlUrl : pullsUrl}
        target="_blank"
        rel="noopener"
        aria-label={label}
      >
        <Badge badgeContent={list.length} color="secondary">
          <CallMergeIcon />
        </Badge>
      </IconButton>
    </Tooltip>
  );
};

const useStyles = makeStyles(theme => ({
  dates: {
    display: 'flex',
    flexDirection: 'column',
    // Na ponta esquerda da linha; o lápis e a engrenagem ficam na direita (mesmo flex do Subheader)
    order: -1,
    marginRight: 'auto',
    paddingRight: theme.spacing(1),
    lineHeight: 1.4,
  },
}));

/**
 * Datas da página (do plugin git-revision-date-localized) na linha do lápis e da engrenagem, à esquerda, sempre
 * como "22/10/2026 12:35:27". Lidas do HTML do TechDocs, que muda a cada página aberta.
 */
const PageDates = ({ shadowRoot }: { shadowRoot?: ShadowRoot }) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const [dates, setDates] = useState<Dates>({});
  useEffect(() => {
    if (!shadowRoot) return undefined;
    const read = () =>
      setDates(prev => {
        const next = readPageDates(shadowRoot);
        return prev.updated === next.updated && prev.created === next.created ? prev : next;
      });
    read();
    const observer = new MutationObserver(read);
    observer.observe(shadowRoot, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [shadowRoot]);

  if (!dates.updated && !dates.created) return null;
  return (
    <div className={classes.dates} data-testid="page-dates">
      {dates.updated && (
        <Typography variant="caption" color="textSecondary">
          {t('addon.lastUpdate', { date: dates.updated })}
        </Typography>
      )}
      {dates.created && (
        <Typography variant="caption" color="textSecondary">
          {t('addon.created', { date: dates.created })}
        </Typography>
      )}
    </div>
  );
};

/**
 * Addon do TechDocs (Subheader): ícone de lápis, ao lado da engrenagem de configurações, que abre o
 * editor visual na página atual (com um ponto quando a pessoa tem um rascunho da página); e o aviso
 * de PRs abertos da página. Os dois só para quem pode editar (useEditAccess); o editor confere a
 * permissão no GitHub de novo ao abrir, então esconder aqui é só para não oferecer o que não funciona.
 */
export const EditPageAddon = () => {
  const { entityRef, shadowRoot } = useTechDocsReaderPage();
  const { pathname } = useLocation();
  const editorRoot = useRouteRef(rootRouteRef);

  // O TechDocs recria o conteúdo do shadow DOM ao trocar de página e leva o <style> junto: reaplica
  useEffect(() => {
    if (!shadowRoot) return undefined;
    hideThemeExtras(shadowRoot);
    const observer = new MutationObserver(() => hideThemeExtras(shadowRoot));
    observer.observe(shadowRoot, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [shadowRoot]);

  // /docs/<namespace>/<kind>/<name>/<página...>
  const page = pathname.split('/').slice(5).filter(Boolean).join('/');
  const ref = stringifyEntityRef(entityRef);
  const params = new URLSearchParams({ entity: ref, page });
  const editorUrl = `${editorRoot()}?${params}`;
  const { canEdit, pending } = useEditAccess(ref, page);
  const { t } = useEditorTranslation();

  const dates = <PageDates shadowRoot={shadowRoot} />;
  if (!canEdit) return dates;
  return (
    <>
      {dates}
      {pending && pending.list.length > 0 && <OpenPullRequests pullsUrl={pending.pullsUrl} list={pending.list} />}
      <Tooltip title={pending?.hasDraft ? t('addon.continueEditing') : t('addon.edit')}>
        <IconButton component={RouterLink} to={editorUrl} aria-label={t('addon.editAria')}>
          <Badge variant="dot" color="secondary" invisible={!pending?.hasDraft} data-testid="draft-dot">
            <EditIcon />
          </Badge>
        </IconButton>
      </Tooltip>
    </>
  );
};
