import { RefObject, useEffect, useRef, useState } from 'react';
import { IconButton, Paper, TextField, Typography, makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import type { MarkdownEditorHandle } from './MarkdownEditor';
import type { SearchResult } from './visualSearch';
import { useEditorTranslation } from './useEditorTranslation';

const NO_RESULT: SearchResult = { current: 0, total: 0 };

const useStyles = makeStyles(theme => ({
  bar: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    padding: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  count: { minWidth: 110 },
}));

/** Busca no modo visual: abre, procura, anda pelos resultados e fecha (limpando o destaque). */
export function useVisualSearch(editorRef: RefObject<MarkdownEditorHandle>) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult>(NO_RESULT);

  const run = (text: string) => {
    setQuery(text);
    setResult(editorRef.current?.search(text) ?? NO_RESULT);
  };
  const move = (delta: 1 | -1) => setResult(editorRef.current?.moveSearch(delta) ?? NO_RESULT);
  const close = () => {
    editorRef.current?.search('');
    setQuery('');
    setResult(NO_RESULT);
    setOpen(false);
  };
  return { open, query, result, show: () => setOpen(true), run, move, close };
}

type Props = Omit<ReturnType<typeof useVisualSearch>, 'open' | 'show'>;

export const SearchBar = ({ query, result, run, move, close }: Props) => {
  const classes = useStyles();
  const { t } = useEditorTranslation();
  const input = useRef<HTMLInputElement>(null);
  // Foco no campo ao abrir (no lugar do autoFocus, que o lint proíbe)
  useEffect(() => input.current?.focus(), []);
  return (
    <Paper className={classes.bar}>
      <TextField
        size="small"
        variant="outlined"
        inputRef={input}
        placeholder={t('search.placeholder')}
        value={query}
        onChange={e => run(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') move(e.shiftKey ? -1 : 1);
          if (e.key === 'Escape') close();
        }}
      />
      <Typography variant="body2" color="textSecondary" className={classes.count}>
        {result.total
          ? t('search.count', { current: String(result.current), total: String(result.total) })
          : query && t('search.none')}
      </Typography>
      <IconButton size="small" title={t('search.previous')} onClick={() => move(-1)}>
        <KeyboardArrowUpIcon />
      </IconButton>
      <IconButton size="small" title={t('search.next')} onClick={() => move(1)}>
        <KeyboardArrowDownIcon />
      </IconButton>
      <IconButton size="small" title={t('search.close')} onClick={close}>
        <CloseIcon />
      </IconButton>
    </Paper>
  );
};
