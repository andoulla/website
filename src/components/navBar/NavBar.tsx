import { useState } from 'react';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckIcon from '@mui/icons-material/Check';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import GitHubIcon from '@mui/icons-material/GitHub';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';
import PaletteIcon from '@mui/icons-material/Palette';
import TuneIcon from '@mui/icons-material/Tune';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import { NavLink, useSearchParams } from 'react-router-dom';

import { useThemeContext } from '@/context/theme';
import { TRACK_PARAM } from '@/context/track';
import { isTrackId } from '@/data/tracks';

import { NAV_DRAWER_BREAKPOINT_PX } from './NavBar.constants';

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: 'inherit',
  textDecoration: 'none',
  fontWeight: isActive ? 700 : 400,
  whiteSpace: 'nowrap',
});

export const NavBar = () => {
  const { themeName, toggleTheme, isDarkMode, toggleDarkMode } = useThemeContext();
  const nextTheme = themeName === 'green' ? 'purple' : 'green';
  // Param read directly, not via useTrackContext — nav also renders outside the provider (/articles).
  const [searchParams] = useSearchParams();
  const rawTrackId = searchParams.get(TRACK_PARAM);
  const trackSearch =
    rawTrackId !== null && isTrackId(rawTrackId) ? `?${TRACK_PARAM}=${rawTrackId}` : '';

  const navLinks = [
    {
      to: `/${trackSearch}`,
      end: true,
      label: 'Home',
      icon: <HomeOutlinedIcon sx={{ fontSize: 20 }} />,
    },
    {
      to: `/skills${trackSearch}`,
      end: false,
      label: 'Skills',
      icon: <InsightsOutlinedIcon sx={{ fontSize: 20 }} />,
    },
    {
      to: '/articles',
      end: false,
      label: 'Articles',
      icon: <ArticleOutlinedIcon sx={{ fontSize: 20 }} />,
    },
  ];

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = anchorEl !== null;
  const handleOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const openNavDrawer = () => setIsNavDrawerOpen(true);
  const closeNavDrawer = () => setIsNavDrawerOpen(false);

  return (
    <>
      <AppBar component="nav" position="static">
        <Toolbar
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            columnGap: 1,
          }}
        >
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            MS
          </Typography>
          <Box sx={{ justifySelf: 'center', display: 'flex', alignItems: 'center' }}>
            <Stack
              direction="row"
              spacing={3}
              sx={(theme) => ({
                alignItems: 'center',
                [theme.breakpoints.down(NAV_DRAWER_BREAKPOINT_PX)]: { display: 'none' },
              })}
            >
              {navLinks.map((link) => (
                <NavLink key={link.label} to={link.to} end={link.end} style={navLinkStyle}>
                  <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
                    {link.icon}
                    {link.label}
                  </Stack>
                </NavLink>
              ))}
            </Stack>
            {/* Padding widens the tap target to ≥44×44 without resizing the icon glyph. */}
            <Tooltip title="Open navigation menu">
              <IconButton
                aria-label="Open navigation menu"
                aria-controls={isNavDrawerOpen ? 'nav-drawer-links' : undefined}
                aria-expanded={isNavDrawerOpen ? 'true' : undefined}
                aria-haspopup="true"
                color="inherit"
                onClick={openNavDrawer}
                size="small"
                sx={(theme) => ({
                  p: 1.25,
                  [theme.breakpoints.up(NAV_DRAWER_BREAKPOINT_PX)]: { display: 'none' },
                })}
              >
                <MenuIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box sx={{ justifySelf: 'end' }}>
            {/* Padding widens the tap target to ≥44×44 without resizing the icon glyph. */}
            <Tooltip title="Open menu">
              <IconButton
                aria-label="Open menu"
                aria-controls={isMenuOpen ? 'nav-menu' : undefined}
                aria-expanded={isMenuOpen ? 'true' : undefined}
                aria-haspopup="true"
                color="inherit"
                onClick={handleOpen}
                size="small"
                sx={{ p: 1.25 }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              id="nav-menu"
              slotProps={{ list: { 'aria-label': 'Settings and links' } }}
              onClose={handleClose}
              open={isMenuOpen}
            >
              <MenuItem
                onClick={() => {
                  toggleTheme();
                  handleClose();
                }}
              >
                <ListItemIcon>
                  <PaletteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Switch to {nextTheme} theme</ListItemText>
              </MenuItem>

              <Divider />

              <MenuItem
                aria-checked={!isDarkMode}
                onClick={() => {
                  if (isDarkMode) toggleDarkMode();

                  handleClose();
                }}
                role="menuitemradio"
              >
                <ListItemIcon>
                  <LightModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Light</ListItemText>
                {!isDarkMode && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
              </MenuItem>
              <MenuItem
                aria-checked={isDarkMode}
                onClick={() => {
                  if (!isDarkMode) toggleDarkMode();

                  handleClose();
                }}
                role="menuitemradio"
              >
                <ListItemIcon>
                  <DarkModeIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Dark</ListItemText>
                {isDarkMode && <CheckIcon fontSize="small" sx={{ ml: 1 }} />}
              </MenuItem>

              <Divider />

              <MenuItem
                component="a"
                href="https://github.com/andoulla/website/"
                onClick={handleClose}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ListItemIcon>
                  <GitHubIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>View Source</ListItemText>
              </MenuItem>
              <MenuItem
                component="a"
                href="https://github.com/andoulla/website/issues/new"
                onClick={handleClose}
                rel="noopener noreferrer"
                target="_blank"
              >
                <ListItemIcon>
                  <BugReportIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Report a Problem</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer anchor="left" onClose={closeNavDrawer} open={isNavDrawerOpen}>
        <Box
          aria-label="Site navigation"
          id="nav-drawer-links"
          role="navigation"
          sx={{ width: 240, pt: 1 }}
        >
          <List>
            {navLinks.map((link) => (
              <ListItem key={link.label} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={link.to}
                  end={link.end}
                  onClick={closeNavDrawer}
                >
                  <ListItemIcon>{link.icon}</ListItemIcon>
                  <ListItemText primary={link.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};
