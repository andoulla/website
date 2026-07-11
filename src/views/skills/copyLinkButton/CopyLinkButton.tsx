import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorIcon from '@mui/icons-material/Error';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const RESET_DELAY_MS = 1500;

type CopyStatus = 'idle' | 'copied' | 'failed';

// Wrapped in an object so a repeated status is still a new reference — timer always restarts.
interface CopyState {
  status: CopyStatus;
}

const IDLE_STATE: CopyState = { status: 'idle' };

const LABEL_BY_STATUS: Record<CopyStatus, string> = {
  idle: 'Copy filtered link',
  copied: 'Link copied',
  failed: "Couldn't copy link",
};

export const CopyLinkButton = () => {
  const location = useLocation();
  const [state, setState] = useState<CopyState>(IDLE_STATE);

  useEffect(() => {
    if (state.status === 'idle') return;
    const timer = setTimeout(() => setState(IDLE_STATE), RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const handleClick = () => {
    void navigator.clipboard
      .writeText(`${window.location.origin}${location.pathname}${location.search}`)
      .then(() => setState({ status: 'copied' }))
      .catch(() => setState({ status: 'failed' }));
  };

  return (
    <Tooltip title={LABEL_BY_STATUS[state.status]}>
      <IconButton aria-label={LABEL_BY_STATUS[state.status]} onClick={handleClick} size="small">
        {state.status === 'idle' && <ContentCopyIcon fontSize="small" />}
        {state.status === 'copied' && <CheckIcon fontSize="small" />}
        {state.status === 'failed' && <ErrorIcon fontSize="small" color="error" />}
      </IconButton>
    </Tooltip>
  );
};
