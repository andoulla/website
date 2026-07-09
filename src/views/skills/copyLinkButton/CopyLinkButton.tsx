import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

const RESET_DELAY_MS = 1500;

export const CopyLinkButton = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_DELAY_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleClick = () => {
    void navigator.clipboard
      .writeText(`${window.location.origin}${location.pathname}${location.search}`)
      .then(() => setCopied(true))
      .catch(() => {
        // clipboard write can reject (permission denied, insecure context) — fail silently
      });
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy filtered link'}>
      <IconButton
        aria-label={copied ? 'Link copied' : 'Copy filtered link'}
        onClick={handleClick}
        size="small"
      >
        {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
};
