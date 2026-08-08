import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Tooltip from '@mui/material/Tooltip';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import type { ViewMode } from '../Skills.types';
import { VIEW_OPTIONS } from '../Skills.constants';
import { VIEW_MODES } from '@/utils/skillsUrlParams';

interface SkillsViewSwitcherProps {
  value: ViewMode;
  onChange: (newValue: ViewMode) => void;
  disabled?: boolean;
}

export const SkillsViewSwitcher = ({ value, onChange, disabled = false }: SkillsViewSwitcherProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // <600px

  const [moreViewsAnchorEl, setMoreViewsAnchorEl] = useState<null | HTMLElement>(null);

  // Determine which view is "primary" (shown as main button on mobile)
  // For mobile, we want to prioritize showing Table if it's available, otherwise use the current value
  const primaryView: ViewMode = 'table';
  const secondaryViews: ViewMode[] = useMemo(
    () => VIEW_MODES.filter((mode) => mode !== primaryView),
    []
  );

  const handleMoreViewsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMoreViewsAnchorEl(event.currentTarget);
  };

  const handleMoreViewsClose = () => {
    setMoreViewsAnchorEl(null);
  };

  const handleSelectView = (viewMode: ViewMode) => {
    onChange(viewMode);
    handleMoreViewsClose();
  };

  // Desktop view: show all 5 views in toggle group
  if (!isMobile) {
    return (
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_e, next: ViewMode | null) => {
          if (next !== null && !disabled) onChange(next);
        }}
        size="small"
        aria-label="View mode"
        disabled={disabled}
        sx={{
          '& .MuiToggleButtonGroup-grouped': { borderRadius: 1 },
          '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
            marginLeft: 0,
            borderLeft: '1px solid',
            borderColor: 'divider',
          },
          '& .MuiToggleButton-root': {
            // Padding-based touch target, ≥44×44px, independent of the icon's own size.
            minWidth: 44,
            minHeight: 44,
            px: { xs: 0.75, sm: 1.25 },
          },
          '& .MuiSvgIcon-root': { fontSize: { xs: '1.1rem', sm: '1.25rem' } },
        }}
      >
        {VIEW_MODES.map((mode) => (
          <Tooltip key={mode} title={VIEW_OPTIONS[mode].label}>
            <ToggleButton value={mode} aria-label={VIEW_OPTIONS[mode].label}>
              {VIEW_OPTIONS[mode].icon}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    );
  }

  // Mobile view: primary button + more views menu
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      {/* View label button */}
      <Button
        variant={value === primaryView ? 'contained' : 'outlined'}
        size="small"
        disabled={disabled}
        onClick={() => handleSelectView(value === primaryView ? primaryView : primaryView)}
        sx={{
          textTransform: 'none',
          minWidth: '120px',
          minHeight: 44,
          fontSize: '0.875rem',
        }}
      >
        {VIEW_OPTIONS[value].label}
      </Button>

      {/* More views menu button — icon-only, so padding widens the tap target to 44×44
          without resizing the glyph, and the Tooltip surfaces the same text visibly. */}
      <Tooltip title="More view options">
        <Button
          variant="outlined"
          size="small"
          disabled={disabled}
          onClick={handleMoreViewsOpen}
          sx={{
            minWidth: 44,
            minHeight: 44,
            p: '10px',
            borderColor: 'divider',
          }}
          aria-label="More view options"
          aria-haspopup="menu"
          aria-expanded={moreViewsAnchorEl !== null}
        >
          <MoreVertIcon sx={{ fontSize: '1.1rem' }} />
        </Button>
      </Tooltip>

      {/* Dropdown menu with other views */}
      <Menu
        anchorEl={moreViewsAnchorEl}
        open={moreViewsAnchorEl !== null}
        onClose={handleMoreViewsClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {secondaryViews.map((mode) => (
          <MenuItem
            key={mode}
            onClick={() => handleSelectView(mode)}
            selected={value === mode}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              minWidth: '180px',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', color: 'inherit', fontSize: '1.2rem' }}>
              {VIEW_OPTIONS[mode].icon}
            </Box>
            {VIEW_OPTIONS[mode].label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
