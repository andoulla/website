import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { ErrorBoundary } from './components/errorBoundary';
import { NavBar } from './components/navBar';
import { PageContainer } from './components/pageContainer';
import { ThemeContextProvider } from './context/theme';
import { CareerDataContextProvider } from './context/careerData';
import { TrackContextProvider } from './context/track';
import { Articles } from './views/articles';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

const App = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route
            element={
              <ErrorBoundary
                fallback={() => (
                  <PageContainer>
                    <Stack sx={{ py: 8, alignItems: 'center', gap: 1.5 }}>
                      <ErrorIcon color="error" fontSize="large" />
                      <Typography color="text.secondary">
                        Whoops — my career history just rage-quit. Try again?
                      </Typography>
                      <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
                        Refresh
                      </Button>
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
        </Routes>
      </BrowserRouter>
    </ThemeContextProvider>
  );
};

export default App;
