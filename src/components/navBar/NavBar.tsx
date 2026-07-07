import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import PaletteIcon from '@mui/icons-material/Palette';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { NavLink } from 'react-router-dom';

import { useThemeContext } from '@/context/theme';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
  whiteSpace: 'nowrap',
});

const toggleButtonGroupSx = {
  '& .MuiToggleButton-root': {
    color: 'inherit',
    borderColor: 'rgba(255,255,255,0.3)',
    px: 1.5,
    py: 0.25,
    '&.Mui-selected': {
      color: 'inherit',
      backgroundColor: 'rgba(255,255,255,0.15)',
    },
    '&.Mui-selected:hover': {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
  },
} as const;

export const NavBar = () => {
  const { themeName, toggleTheme, isDarkMode, toggleDarkMode } = useThemeContext();
  const nextTheme = themeName === 'green' ? 'purple' : 'green';
  const theme = useTheme();
  const isNarrow = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar component="nav" position="static">
      <Toolbar
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          columnGap: 1,
        }}
      >
        {/* Empty spacer mirrors the controls column's grid track so the nav links land in the
            true center of the toolbar, however wide the controls column ends up being. */}
        <Box />
        <Stack direction="row" spacing={isNarrow ? 1.5 : 3} sx={{ justifySelf: 'center' }}>
          <NavLink to="/" end style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/skills" style={navLinkStyle}>
            Skills
          </NavLink>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', justifySelf: 'end' }}>
          <IconButton
            aria-label={`Switch to ${nextTheme} theme`}
            color="inherit"
            onClick={toggleTheme}
            size="small"
          >
            <PaletteIcon />
          </IconButton>
          <ToggleButtonGroup
            aria-label="Color mode"
            exclusive
            onChange={(_, value: 'light' | 'dark' | null) => {
              if (value !== null) toggleDarkMode();
            }}
            size="small"
            sx={toggleButtonGroupSx}
            value={isDarkMode ? 'dark' : 'light'}
          >
            <ToggleButton value="light" aria-label="Light">
              {isNarrow ? <LightModeIcon fontSize="small" /> : 'Light'}
            </ToggleButton>
            <ToggleButton value="dark" aria-label="Dark">
              {isNarrow ? <DarkModeIcon fontSize="small" /> : 'Dark'}
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
