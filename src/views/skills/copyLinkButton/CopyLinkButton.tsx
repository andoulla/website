import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ErrorIcon from '@mui/icons-material/Error';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { visuallyHidden } from '@mui/utils';

const RESET_DELAY_MS = 1500;

type CopyStatus = 'idle' | 'copied' | 'failed';

// Wrapped in an object so a repeated status is still a new reference — timer always restarts.
interface CopyState {
  status: CopyStatus;
}

const IDLE_STATE: CopyState = { status: 'idle' };

const LABEL_BY_STATUS: Record<CopyStatus, string> = {
  idle: 'Share link',
  copied: 'Link copied',
  failed: "Couldn't copy link",
};

const renderStatusIcon = (status: CopyStatus) => {
  if (status === 'copied') return <CheckIcon fontSize="small" />;

  if (status === 'failed') return <ErrorIcon fontSize="small" color="error" />;

  return <ContentCopyIcon fontSize="small" />;
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
    <>
      <Button
        variant="outlined"
        color="inherit"
        size="small"
        startIcon={renderStatusIcon(state.status)}
        onClick={handleClick}
        // Match the 36px height and divider border of the other toolbar controls.
        sx={{ height: 36, borderColor: 'divider' }}
      >
        {LABEL_BY_STATUS[state.status]}
      </Button>
      {/* role="status" — polite live region announcing the copy result to screen readers */}
      <Box component="span" role="status" sx={visuallyHidden}>
        {state.status === 'idle' ? '' : LABEL_BY_STATUS[state.status]}
      </Box>
    </>
  );
};
