import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import { useTrackContext } from '@/context/track';
import { SKILL_PARAM } from '@/utils/skillsUrlParams';
import type { SkillSummary } from '@/utils/calculateSkillYears';

export interface RowActionsMenuProps {
  skill: SkillSummary;
}

export const RowActionsMenu = ({ skill }: RowActionsMenuProps) => {
  const { trackId } = useTrackContext();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const skillLink = `/?${SKILL_PARAM}=${encodeURIComponent(skill.skill)}&track=${trackId}`;
  const label = `${skill.skill} links`;

  return (
    <>
      {/* Padding widens the tap target to ≥44×44 without resizing the icon glyph. */}
      <Tooltip title={label}>
        <IconButton
          size="small"
          aria-label={label}
          onClick={(event) => {
            setAnchorEl(event.currentTarget);
          }}
          sx={{ p: 1.5 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={anchorEl !== null}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <MenuItem
          component={RouterLink}
          to={skillLink}
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
