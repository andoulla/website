import AppBar from '@mui/material/AppBar';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import { NavLink } from 'react-router-dom';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
});

export function NavBar() {
  return (
    <AppBar component="nav" position="static">
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Stack direction="row" spacing={3}>
          <NavLink to="/" end style={navLinkStyle}>
            Home
          </NavLink>
          <NavLink to="/skills" style={navLinkStyle}>
            Skills
          </NavLink>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
