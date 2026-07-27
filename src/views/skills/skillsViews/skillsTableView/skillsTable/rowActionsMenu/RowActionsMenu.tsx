import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { TRACK_PARAM, useTrackContext } from '@/context/track';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface RowActionsMenuProps {
  skill: SkillSummary;
}

export const RowActionsMenu = ({ skill }: RowActionsMenuProps) => {
  const { trackId } = useTrackContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        size="small"
        aria-label={`${skill.skill} links`}
        onClick={(event) => {
          setAnchorEl(event.currentTarget);
        }}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem
          component={RouterLink}
          to={`/?skill=${encodeURIComponent(skill.skill)}&${TRACK_PARAM}=${trackId}`}
          onClick={() => {
            setAnchorEl(null);
          }}
        >
          View on Resume
        </MenuItem>
      </Menu>
    </>
  );
};
