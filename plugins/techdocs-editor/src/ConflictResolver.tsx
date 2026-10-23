import { useState } from 'react';
import { Button, Grid, Paper, Typography, makeStyles } from '@material-ui/core';
import { Alert, ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { useEditorTranslation } from './useEditorTranslation';
import { ConflictChoice, MergeChunk, conflictCount, resolveChunks } from '@edtroleis/plugin-techdocs-editor-common';

const useStyles = makeStyles(theme => ({
  root: { padding: theme.spacing(2) },
  conflict: { marginTop: theme.spacing(3) },
  context: {
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    whiteSpace: 'pre-wrap',
    margin: theme.spacing(1, 0),
  },
  version: {
    padding: theme.spacing(1, 1.5),
    height: '100%',
    fontFamily: 'monospace',
    fontSize: '0.85rem',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  },
  chosen: { outline: `2px solid ${theme.palette.primary.main}` },
  empty: { fontStyle: 'italic', color: theme.palette.text.secondary },
  choices: { marginTop: theme.spacing(1) },
  footer: { display: 'flex', gap: theme.spacing(1), marginTop: theme.spacing(3), alignItems: 'center' },
}));

/** Até quantas linhas antes do conflito mostrar, para a pessoa achar o ponto no texto. */
const CONTEXT_LINES = 2;

const Version = ({ title, lines, chosen }: { title: string; lines: string[]; chosen: boolean }) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const text = lines.join('\n').trim();
  return (
    <Paper variant="outlined" className={`${classes.version} ${chosen ? classes.chosen : ''}`}>
      <Typography variant="subtitle2" style={{ fontFamily: 'inherit' }}>
        {title}
      </Typography>
      {text ? text : <span className={classes.empty}>{t('conflict.removed')}</span>}
    </Paper>
  );
};

/**
 * Resolução de conflito com a versão publicada: em cada trecho alterado dos dois lados, a pessoa
 * escolhe a versão publicada, a sua ou as duas. O resto do texto já foi juntado automaticamente.
 */
export const ConflictResolver = (props: {
  chunks: MergeChunk[];
  busy: boolean;
  onDone: (content: string) => void;
  onCancel: () => void;
}) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const total = conflictCount(props.chunks);
  const [choices, setChoices] = useState<(ConflictChoice | undefined)[]>(() => Array(total).fill(undefined));
  const missing = choices.filter(c => !c).length;

  let n = -1;
  return (
    <div className={classes.root} data-testid="conflict-resolver">
      <Typography variant="h6">{t('conflict.title')}</Typography>
      <Typography variant="body2">{t('conflict.intro', { count: total })}</Typography>
      {total === 0 && (
        <Alert severity="info" style={{ marginTop: 16 }}>
          {t('conflict.nothingToChoose')}
        </Alert>
      )}
      {props.chunks.map((chunk, i) => {
        if (chunk.kind === 'same') return null;
        const index = ++n;
        const previous = props.chunks[i - 1];
        const context = previous?.kind === 'same' ? previous.lines.slice(-CONTEXT_LINES).join('\n').trim() : '';
        const choice = choices[index];
        return (
          <div key={i} className={classes.conflict} data-testid="conflict">
            <Typography variant="subtitle2">
              {t('conflict.passage', { index: String(index + 1), total: String(total) })}
            </Typography>
            {context && <div className={classes.context}>…{context}</div>}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Version title={t('conflict.published')} lines={chunk.theirs} chosen={choice === 'theirs' || choice === 'both'} />
              </Grid>
              <Grid item xs={12} md={6}>
                <Version title={t('conflict.mine')} lines={chunk.mine} chosen={choice === 'mine' || choice === 'both'} />
              </Grid>
            </Grid>
            <ToggleButtonGroup
              exclusive
              size="small"
              className={classes.choices}
              value={choice ?? null}
              onChange={(_, next: ConflictChoice | null) =>
                next && setChoices(prev => prev.map((c, k) => (k === index ? next : c)))
              }
            >
              <ToggleButton value="theirs">{t('conflict.keepPublished')}</ToggleButton>
              <ToggleButton value="mine">{t('conflict.keepMine')}</ToggleButton>
              <ToggleButton value="both">{t('conflict.keepBoth')}</ToggleButton>
            </ToggleButtonGroup>
          </div>
        );
      })}
      <div className={classes.footer}>
        <Button
          variant="contained"
          color="primary"
          disabled={props.busy || missing > 0}
          onClick={() => props.onDone(resolveChunks(props.chunks, choices as ConflictChoice[]))}
        >
          {t('conflict.finish')}
        </Button>
        <Button disabled={props.busy} onClick={props.onCancel}>
          {t('conflict.cancel')}
        </Button>
        {missing > 0 && (
          <Typography variant="caption" color="textSecondary">
            {t('conflict.missing', { count: missing })}
          </Typography>
        )}
      </div>
    </div>
  );
};
