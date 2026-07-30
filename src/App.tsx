import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import RefreshIcon from '@mui/icons-material/Refresh';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/errorBoundary';
import { DensityToggle } from './components/densityToggle';
import { NavBar } from './components/navBar';
import { PageContainer } from './components/pageContainer';
import { ScrollToTop } from './components/scrollToTop';
import { ThemeContextProvider } from './context/theme';
import { CareerDataContextProvider } from './context/careerData';
import { TrackContextProvider } from './context/track';
import { Articles } from './views/articles';
import { NotFound } from './views/notFound';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO?: job headlines — one-line summary per job, visible on collapsed resume cards

const App = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <ScrollToTop />
        <NavBar />
        <Box sx={{ mb: 2, textAlign: 'right', px: 2 }}>
          <DensityToggle />
        </Box>
        <Routes>
          <Route
            element={
              <ErrorBoundary
                fallback={() => (
                  <PageContainer>
                    <Stack
                      sx={{ minHeight: '70vh', justifyContent: 'center', alignItems: 'center' }}
                    >
                      <Stack
                        sx={{
                          alignItems: 'center',
                          gap: 1.5,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 2,
                          px: 6,
                          py: 4,
                        }}
                      >
                        <ManageSearchIcon fontSize="large" color="primary" />
                        <Typography color="text.secondary">
                          Whoops — my career history just rage-quit. Try again?
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Hit refresh to relaunch it — that usually does the trick.
                        </Typography>
                        <Button
                          startIcon={<RefreshIcon />}
                          onClick={() => window.location.reload()}
                        >
                          Refresh
                        </Button>
                      </Stack>
                    </Stack>
                  </PageContainer>
                )}
              >
                <TrackContextProvider>
                  <CareerDataContextProvider>
                    <Outlet />
                  </CareerDataContextProvider>
                </TrackContextProvider>
              </ErrorBoundary>
            }
          >
            <Route path="/" element={<Resume />} />
            <Route path="/skills" element={<Skills />} />
          </Route>
          <Route path="/articles" element={<Articles />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Analytics />
      <SpeedInsights />
    </ThemeContextProvider>
  );
};

export default App;
