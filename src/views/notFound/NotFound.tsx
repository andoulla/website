import SearchOffIcon from '@mui/icons-material/SearchOff';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

import { PageContainer } from '@/components/pageContainer';

export const NotFound = () => (
  <PageContainer>
    <title>Page not found — Mariandi Stylianou</title>
    {/* Full remaining viewport below the nav bar (56px on xs, 64px from sm) minus the
        container's vertical padding, so the box sits dead centre of the visible page. */}
    <Stack
      sx={(theme) => ({
        minHeight: {
          xs: `calc(100dvh - 56px - ${theme.spacing(8)})`,
          sm: `calc(100dvh - 64px - ${theme.spacing(8)})`,
        },
        justifyContent: 'center',
        alignItems: 'center',
      })}
    >
      <Stack
        sx={(theme) => ({
          alignItems: 'center',
          gap: 1.5,
          border: 2,
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.06),
          px: 8,
          py: 5,
        })}
      >
        <SearchOffIcon color="primary" sx={{ fontSize: 64 }} />
        <Typography color="text.secondary">This page doesn&apos;t exist.</Typography>
        <Button component={RouterLink} to="/">
          Go to home
        </Button>
      </Stack>
    </Stack>
  </PageContainer>
);
