import { Link } from '@backstage/core-components';
import { Button, Card, CardContent, CircularProgress, Typography, makeStyles } from '@material-ui/core';
import BuildIcon from '@material-ui/icons/Build';
import type { RepoSetup } from './useRepoSetup';
import { useEditorTranslation } from './useEditorTranslation';

const useStyles = makeStyles(theme => ({
  card: { marginTop: theme.spacing(2) },
  list: { margin: theme.spacing(1, 0), paddingLeft: theme.spacing(2.5) },
  error: { color: theme.palette.error.main },
}));

/** Aviso para quem é admin: o que falta no repositório e o botão "Configurar verificações". */
export const SetupNotice = ({ setup }: { setup: RepoSetup }) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const { steps, busy, result, error, apply } = setup;
  if (!steps.length && !result && !error) return null;

  return (
    <Card variant="outlined" className={classes.card} data-testid="repo-setup">
      <CardContent>
        <Typography variant="subtitle2">{t('setup.title')}</Typography>
        {steps.length > 0 && (
          <>
            <Typography variant="body2" color="textSecondary">
              {t('setup.missing')}
            </Typography>
            <ul className={classes.list}>
              {steps.map(step => (
                <li key={step}>
                  <Typography variant="body2">{t(`setup.steps.${step}`)}</Typography>
                </li>
              ))}
            </ul>
            <Button
              variant="outlined"
              size="small"
              startIcon={busy ? <CircularProgress size={16} /> : <BuildIcon />}
              disabled={busy}
              onClick={apply}
            >
              {t('setup.button')}
            </Button>
          </>
        )}
        {result && (
          <Typography variant="body2" data-testid="repo-setup-done">
            {result.pullRequest
              ? t('setup.donePr', {
                  link: (
                    <Link to={result.pullRequest.htmlUrl} target="_blank">
                      {t('panel.pullRequest')}
                    </Link>
                  ),
                })
              : t('setup.done')}
          </Typography>
        )}
        {error && (
          <Typography variant="body2" className={classes.error}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
