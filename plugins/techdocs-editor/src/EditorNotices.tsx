import { ReactNode } from 'react';
import { Link } from '@backstage/core-components';
import { Button, makeStyles } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import type { OpenPullRequest } from '@edtroleis/plugin-techdocs-editor-common';
import { useEditorTranslation } from './useEditorTranslation';

const useStyles = makeStyles(theme => ({
  notice: { marginBottom: theme.spacing(2) },
}));

type Props = {
  /** Modo demonstração: as alterações vão com a conta do servidor. */
  proxyMode: boolean;
  editedBy: string;
  /** PRs da própria pessoa abertos fora do editor (outra branch). */
  ownPrs: OpenPullRequest[];
  /** PRs de outras pessoas que alteram a página. */
  otherPeoplePrs: OpenPullRequest[];
  /** Há conflito com a versão publicada e a tela de resolução não está aberta. */
  showConflict: boolean;
  /** Há texto não salvo (resolver o conflito exige salvar antes). */
  dirty: boolean;
  busy: boolean;
  onResolve: () => void;
  /** O texto não salvo foi recuperado do navegador. */
  restored: boolean;
  notice?: ReactNode;
  onCloseNotice: () => void;
  error?: string;
  onCloseError: () => void;
};

const PullLinks = ({ prs, withAuthor }: { prs: OpenPullRequest[]; withAuthor?: boolean }) => {
  const { t } = useEditorTranslation();
  return (
    <>
      {prs.map((p, i) => (
        <span key={p.number}>
          {i > 0 && ', '}
          <Link to={p.htmlUrl} target="_blank">
            {t('notices.pullRequestLink', { number: String(p.number) })}
          </Link>
          {withAuthor && p.author && ` (${p.author})`}
        </span>
      ))}
    </>
  );
};

/** Avisos no alto do editor, do mais permanente (modo demonstração) ao resultado da última ação. */
export const EditorNotices = (props: Props) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const { ownPrs, otherPeoplePrs } = props;
  return (
    <>
      {props.proxyMode && (
        <Alert severity="warning" className={classes.notice}>
          {t('notices.demoMode', { user: <strong>{props.editedBy}</strong> })}
        </Alert>
      )}
      {ownPrs.length > 0 && (
        <Alert severity="info" className={classes.notice} data-testid="own-prs">
          {t('notices.ownPrs', { count: ownPrs.length, links: <PullLinks prs={ownPrs} /> })}
        </Alert>
      )}
      {otherPeoplePrs.length > 0 && (
        <Alert severity="info" className={classes.notice} data-testid="others-prs">
          {t('notices.othersPrs', { links: <PullLinks prs={otherPeoplePrs} withAuthor /> })}
        </Alert>
      )}
      {props.showConflict && (
        <Alert
          severity="warning"
          className={classes.notice}
          data-testid="conflict-alert"
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              disabled={props.busy || props.dirty}
              onClick={props.onResolve}
            >
              {t('notices.resolveConflict')}
            </Button>
          }
        >
          {t('notices.conflict')} {props.dirty ? t('notices.conflictSaveFirst') : t('notices.conflictChoose')}
        </Alert>
      )}
      {props.restored && (
        <Alert severity="info" className={classes.notice}>
          {t('notices.restored')}
        </Alert>
      )}
      {props.notice && (
        <Alert severity="success" className={classes.notice} onClose={props.onCloseNotice}>
          {props.notice}
        </Alert>
      )}
      {props.error && (
        <Alert severity="error" className={classes.notice} onClose={props.onCloseError}>
          {props.error}
        </Alert>
      )}
    </>
  );
};
