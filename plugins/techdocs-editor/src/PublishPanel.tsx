import { Link } from '@backstage/core-components';
import {
  Button,
  Card,
  IconButton,
  Tooltip,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Link as MuiLink,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  makeStyles,
} from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import ErrorIcon from '@material-ui/icons/Error';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import PublishIcon from '@material-ui/icons/Publish';
import SaveIcon from '@material-ui/icons/Save';
import SendIcon from '@material-ui/icons/Send';
import {
  Annotation,
  CheckRun,
  ChecksSummary,
  failureHelp,
  isFailed,
  type LintFinding,
  parseAnnotation,
  PullRequest,
} from '@edtroleis/plugin-techdocs-editor-common';
import { useEditorTranslation } from './useEditorTranslation';

const useStyles = makeStyles(theme => ({
  actions: { display: 'flex', flexDirection: 'column', gap: theme.spacing(1), margin: theme.spacing(2, 0) },
  buttons: { display: 'flex', alignItems: 'center', gap: theme.spacing(0.5) },
  // Descartar fica separado, na ponta, para não ser clicado sem querer
  discard: { marginLeft: 'auto' },
  ok: { color: theme.palette.success.main },
  bad: { color: theme.palette.error.main },
  annotation: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
  chip: { marginBottom: theme.spacing(1) },
  lint: { margin: theme.spacing(1, 0) },
  fix: { display: 'flex', margin: theme.spacing(1, 0), textTransform: 'none' },
}));

/** Quantos problemas de formatação listar (o resto aparece na visão Markdown). */
const MAX_LINT_SHOWN = 8;

type Props = {
  /** O que "Salvar e verificar" confere: os checks do GitHub ou só o lint do editor (repositório sem pipeline). */
  verification: 'pipeline' | 'editor';
  /** Mensagem em linguagem simples por nome de check (configuração do plugin). */
  checkHelp: Record<string, string>;
  /** Nenhum check começou no tempo esperado (o repositório pode não ter pipeline para PRs). */
  stalled: boolean;
  pr: PullRequest | null;
  checks: CheckRun[];
  checksSummary: ChecksSummary;
  annotations: Record<number, Annotation[]>;
  pollError?: string;
  requiredApprovals: number;
  dirty: boolean;
  /** Existe rascunho salvo no GitHub (branch do rascunho). */
  hasDraft: boolean;
  /** O rascunho foi salvo depois da última verificação (as verificações mostradas são antigas). */
  unverified: boolean;
  /** O rascunho conflita com a versão publicada: verificar e enviar esperam a resolução. */
  conflict: boolean;
  /** Problemas de formatação achados no editor; com algum, salvar e publicar ficam travados. */
  lintProblems: LintFinding[];
  busy: boolean;
  docsUrl: string;
  /** Só guarda o texto, sem lint nem verificações. */
  onSaveDraft: () => void;
  /** Lint, salva e dispara as verificações automáticas. */
  onVerify: () => void;
  onSend: () => void;
  onDiscard: () => void;
  /** Aplica as correções automáticas do lint no texto. */
  onFixLint: () => void;
  /** Abre a visão Markdown do editor nessa linha. */
  onShowLine: (line: number) => void;
};

/** Lista de problemas de formatação com a linha, o trecho de texto e "ver linha". */
const LintList = ({
  problems,
  classes,
  onShowLine,
}: {
  problems: LintFinding[];
  classes: ReturnType<typeof useStyles>;
  onShowLine: (line: number) => void;
}) => {
  const { t, ruleText } = useEditorTranslation();
  return (
    <>
      {problems.slice(0, MAX_LINT_SHOWN).map((p, i) => (
        <span key={i} className={classes.annotation} style={{ display: 'block' }}>
          <strong>{t('panel.lineLabel', { line: String(p.line) })}</strong> {ruleText(p.rule, p.message)}
          {p.snippet && <> {t('panel.near', { snippet: p.snippet })}</>}{' '}
          <MuiLink component="button" variant="caption" onClick={() => onShowLine(p.line)}>
            {t('panel.showLine')}
          </MuiLink>
        </span>
      ))}
      {problems.length > MAX_LINT_SHOWN && (
        <Typography variant="caption" color="textSecondary">
          {t('panel.andMore', { count: String(problems.length - MAX_LINT_SHOWN) })}
        </Typography>
      )}
    </>
  );
};

/** Botão só com ícone e dica; o span deixa a dica aparecer mesmo com o botão desativado. */
const Action = (props: {
  title: string;
  icon: JSX.Element;
  disabled: boolean;
  onClick: () => void;
  color?: 'primary' | 'secondary';
  className?: string;
}) => (
  <Tooltip title={props.title}>
    <span className={props.className}>
      <IconButton aria-label={props.title} color={props.color} disabled={props.disabled} onClick={props.onClick}>
        {props.icon}
      </IconButton>
    </span>
  </Tooltip>
);

/** Ícone do estado de um check: rodando, reprovado ou aprovado. */
const checkIcon = (run: CheckRun, classes: ReturnType<typeof useStyles>) => {
  if (run.status !== 'completed') return <CircularProgress size={16} />;
  if (isFailed(run)) return <ErrorIcon fontSize="small" className={classes.bad} />;
  return <CheckCircleIcon fontSize="small" className={classes.ok} />;
};

/** Lateral do editor: estado da publicação, botões e resultado da pipeline em linguagem simples. */
export const PublishPanel = (props: Props) => {
  const classes = useStyles();
  const { t, ruleText } = useEditorTranslation();
  const { pr, checks, checksSummary, requiredApprovals, dirty, busy, unverified, conflict } = props;
  const openPr = pr?.state === 'open' ? pr : null;
  const sendLabel = requiredApprovals > 0 ? t('panel.sendForReview') : t('panel.sendForPublication');
  // Com verificação falhando e nada novo para salvar, publicar só deixaria o PR esperando para sempre
  const blockedByChecks = Boolean(openPr) && checksSummary === 'failed' && !dirty && !unverified;
  // O que tem correção automática é ajustado ao salvar; só trava o que precisa de decisão da pessoa
  const blocking = props.lintProblems.filter(p => !p.fixable);
  const autoFixed = props.lintProblems.filter(p => p.fixable);
  const blockedByLint = blocking.length > 0;
  // Enviar só o que já passou por "Salvar e verificar": PR em rascunho, sem nada novo depois
  const verified = Boolean(openPr?.draft) && !dirty && !unverified;
  const canSend = verified && !blockedByChecks && !conflict && !busy;
  let sendHint = '';
  if (conflict) sendHint = ` ${t('panel.sendHintConflict')}`;
  else if (!verified && (dirty || unverified || !openPr)) sendHint = ` ${t('panel.sendHintCheck')}`;
  else if (blockedByChecks) sendHint = ` ${t('panel.sendHintChecks')}`;

  let chip: { label: string; color: 'default' | 'primary' | 'secondary' };
  let explanation: string;
  if (pr?.merged) {
    chip = { label: t('panel.status.published'), color: 'primary' };
    explanation = t('panel.explanation.published');
  } else if (conflict) {
    // Com conflito o GitHub não roda as verificações nem deixa fazer o merge
    chip = { label: t('panel.status.conflict'), color: 'secondary' };
    explanation = t('panel.explanation.conflict');
  } else if (dirty) {
    chip = { label: t('panel.status.unsaved'), color: 'default' };
    explanation = t('panel.explanation.unsaved');
  } else if (unverified) {
    chip = { label: t('panel.status.savedNotChecked'), color: 'default' };
    explanation = t('panel.explanation.savedNotChecked');
  } else if (!openPr) {
    chip = { label: t('panel.status.noChanges'), color: 'default' };
    explanation = t('panel.explanation.noChanges');
  } else if (checksSummary === 'failed') {
    chip = { label: t('panel.status.needsFixes'), color: 'secondary' };
    explanation = t('panel.explanation.needsFixes');
  } else if (openPr.draft) {
    chip = { label: t('panel.status.draft'), color: 'default' };
    explanation = t('panel.explanation.draft');
  } else if (requiredApprovals > 0) {
    chip = { label: t('panel.status.inReview'), color: 'primary' };
    explanation = t('panel.explanation.inReview', { count: requiredApprovals });
  } else {
    chip = { label: t('panel.status.awaitingPublication'), color: 'primary' };
    explanation = t('panel.explanation.awaitingPublication');
  }

  return (
    <Card>
      <CardContent>
        <Chip className={classes.chip} label={chip.label} color={chip.color} />
        <Typography variant="body2">{explanation}</Typography>
        {openPr && !openPr.draft && (
          <Typography variant="body2" data-testid="pr-link">
            <Link to={openPr.htmlUrl} target="_blank">
              {t('panel.viewPullRequest', { number: String(openPr.number) })}
            </Link>
          </Typography>
        )}

        <div className={classes.actions}>
          <div className={classes.buttons}>
            <Action
              title={t('panel.saveDraft')}
              icon={<SaveIcon />}
              disabled={busy || !dirty}
              onClick={props.onSaveDraft}
            />
            <Action
              title={conflict ? t('panel.saveAndCheckConflict') : t('panel.saveAndCheck')}
              icon={<PlaylistAddCheckIcon />}
              // Com verificação falhando, verificar de novo aplica os ajustes automáticos (ex.: linguagem do bloco)
              disabled={busy || conflict || blockedByLint || !(dirty || unverified || blockedByChecks)}
              onClick={props.onVerify}
            />
            <Action
              title={`${t(requiredApprovals > 0 ? 'panel.sendTooltipReview' : 'panel.sendTooltip', { label: sendLabel })}${sendHint}`}
              icon={requiredApprovals > 0 ? <SendIcon /> : <PublishIcon />}
              color="primary"
              disabled={!canSend}
              onClick={props.onSend}
            />
            {(openPr || props.hasDraft) && (
              <Action
                title={t('panel.discard')}
                icon={<DeleteOutlineIcon />}
                className={classes.discard}
                disabled={busy}
                onClick={props.onDiscard}
              />
            )}
            {busy && <CircularProgress size={20} />}
          </div>
          {blockedByLint && (
            <div className={classes.lint} data-testid="lint-problems">
              <Typography variant="subtitle2" className={classes.bad}>
                {t('panel.lintProblems', { count: blocking.length })}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {t('panel.lintBlockingHelp')}
              </Typography>
              <LintList problems={blocking} classes={classes} onShowLine={props.onShowLine} />
            </div>
          )}
          {autoFixed.length > 0 && (
            <div className={classes.lint} data-testid="lint-auto-fixed">
              <Typography variant="subtitle2">{t('panel.autoFixTitle')}</Typography>
              <LintList problems={autoFixed} classes={classes} onShowLine={props.onShowLine} />
              <Button
                size="small"
                variant="outlined"
                className={classes.fix}
                startIcon={<BuildIcon />}
                disabled={busy}
                onClick={props.onFixLint}
              >
                {t('panel.fixNow')}
              </Button>
            </div>
          )}
          {blockedByChecks && (
            <Typography variant="caption" color="textSecondary">
              {t('panel.checksBlockingHelp')}
            </Typography>
          )}

        </div>

        {pr?.merged && <Link to={props.docsUrl}>{t('panel.viewPublishedPage')}</Link>}

        {openPr && (
          <>
            <Divider />
            <Typography variant="subtitle2" style={{ marginTop: 12 }}>
              {t('panel.checksTitle')}
            </Typography>
            {props.verification === 'editor' && (
              <Typography variant="body2" color="textSecondary" data-testid="no-pipeline">
                {t('panel.noPipeline')}
              </Typography>
            )}
            {props.verification === 'pipeline' && unverified && (
              <Typography variant="body2" color="textSecondary">
                {t('panel.changedAfterCheck')}
              </Typography>
            )}
            {props.verification === 'pipeline' && !unverified && checks.length === 0 && !props.pollError && (
              <Typography variant="body2" color="textSecondary" data-testid="checks-waiting">
                {props.stalled
                  ? t('panel.checksStalled', {
                      link: (
                        <Link to={openPr.htmlUrl} target="_blank">
                          {t('panel.pullRequest')}
                        </Link>
                      ),
                    })
                  : t('panel.checksStarting')}
              </Typography>
            )}
            {props.pollError && (
              <Typography variant="body2" className={classes.bad}>
                {t('panel.checksPollError', { error: props.pollError })}
              </Typography>
            )}
            <List dense disablePadding>
              {props.verification === 'pipeline' && !unverified && checks.map(run => (
                <ListItem key={run.id} disableGutters alignItems="flex-start">
                  <ListItemIcon style={{ minWidth: 32 }}>
                    {checkIcon(run, classes)}
                  </ListItemIcon>
                  <ListItemText
                    primary={run.name}
                    secondary={
                      isFailed(run) ? (
                        <>
                          {failureHelp(run.name, props.checkHelp) ?? t('panel.defaultFailure')}
                          {(props.annotations[run.id] ?? []).slice(0, 5).map((a, i) => (
                            <span key={i} className={classes.annotation} style={{ display: 'block' }}>
                              <strong>{t('panel.lineLabel', { line: String(a.line) })}</strong>{' '}
                              {ruleText(parseAnnotation(a).rule, parseAnnotation(a).description)}
                              {a.snippet && <> {t('panel.near', { snippet: a.snippet })}</>}{' '}
                              <MuiLink component="button" variant="caption" onClick={() => props.onShowLine(a.line)}>
                                {t('panel.showLine')}
                              </MuiLink>
                            </span>
                          ))}
                          {dirty && (props.annotations[run.id] ?? []).length > 0 && (
                            <span className={classes.annotation} style={{ display: 'block' }}>
                              {t('panel.linesFromSaved')}
                            </span>
                          )}
                          <Link to={run.htmlUrl}>{t('panel.details')}</Link>
                        </>
                      ) : undefined
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" color="textSecondary">
              <Link to={openPr.htmlUrl}>{t('panel.openOnGitHub', { number: String(openPr.number) })}</Link>
            </Typography>
          </>
        )}
      </CardContent>
    </Card>
  );
};
