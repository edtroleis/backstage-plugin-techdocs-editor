import { useEffect, useState } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { FileVersion, GitHubClient } from '@edtroleis/plugin-techdocs-editor-common';
import { useEditorTranslation } from './useEditorTranslation';

type Props = {
  open: boolean;
  client: GitHubClient;
  filePath: string;
  /** Branch publicada (a principal do repositório). */
  branch: string;
  busy: boolean;
  onRestore: (version: FileVersion) => void;
  onClose: () => void;
};

/** Data e hora curtas no idioma e no fuso do navegador (ex.: "22/10/2026 12:35"). */
export const formatVersionDate = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });

/**
 * Histórico da página: as versões publicadas (commits da branch principal que alteraram o arquivo).
 * "Restaurar" coloca o texto da versão no editor; daí em diante é o fluxo normal (salvar, verificar,
 * enviar). Restaurar a mais recente volta o editor à versão publicada.
 */
export const HistoryDialog = ({ open, client, filePath, branch, busy, onRestore, onClose }: Props) => {
  const { t } = useEditorTranslation();
  const [versions, setVersions] = useState<FileVersion[]>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!open) return undefined;
    let cancelled = false;
    setVersions(undefined);
    setError(undefined);
    client
      .getFileHistory(filePath, branch)
      .then(list => !cancelled && setVersions(list))
      .catch(e => !cancelled && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      cancelled = true;
    };
  }, [open, client, filePath, branch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth aria-labelledby="history-title">
      <DialogTitle id="history-title">{t('history.title')}</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('history.intro')}
        </Typography>
        {error && <Alert severity="error">{t('history.loadError', { error })}</Alert>}
        {!versions && !error && <CircularProgress size={24} />}
        {versions?.length === 0 && (
          <Typography variant="body2">{t('history.empty')}</Typography>
        )}
        {versions && versions.length > 0 && (
          <List dense data-testid="history-list">
            {versions.map((version, i) => (
              <ListItem key={version.sha} divider>
                <ListItemText
                  primary={`${formatVersionDate(version.date)}${i === 0 ? ` · ${t('history.current')}` : ''}`}
                  secondary={[version.title, version.author].filter(Boolean).join(' · ')}
                />
                <ListItemSecondaryAction>
                  <Button size="small" color="primary" disabled={busy} onClick={() => onRestore(version)}>
                    {t('history.restore')}
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('history.close')}</Button>
      </DialogActions>
    </Dialog>
  );
};
