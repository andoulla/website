import PaletteIcon from '@mui/icons-material/Palette';
import AppBar from '@mui/material/AppBar';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Toolbar from '@mui/material/Toolbar';
import { NavLink } from 'react-router-dom';

import { useThemeContext } from '@/context/theme';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
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

  return (
    <AppBar component="nav" position="static">
      <Toolbar sx={{ position: 'relative' }}>
        <Stack
          direction="row"
          spacing={3}
          sx={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
        >
          <NavLink to="/" end style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/skills" style={navLinkStyle}>
            Skills
          </NavLink>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', ml: 'auto' }}>
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
            <ToggleButton value="light">Light</ToggleButton>
            <ToggleButton value="dark">Dark</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};
