import PaletteIcon from '@mui/icons-material/Palette';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { NavLink } from 'react-router-dom';

import { useThemeContext } from '../../context/theme';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
});

export function NavBar() {
  const { themeName, toggleTheme } = useThemeContext();
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
        <Box sx={{ ml: 'auto' }}>
          <IconButton
            aria-label={`Switch to ${nextTheme} theme`}
            color="inherit"
            onClick={toggleTheme}
            size="small"
          >
            <PaletteIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
