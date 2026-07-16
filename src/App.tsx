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
// TODO: when hovering over tooltip in skills user can't click the links because it keeps moving left or right
// TODO: bug, when clicking on a category orsubcategory in resume, it should go to barchart and have the skill selected , not just on the url but in the filters
// TODO: bug when clicking on a skill in the barchart, it should go to the skill page and have the skill selected, not just on the url but in the filters, and the skill should be at the top
// TODO: bug animation on timelineeventCard, don't hide the top card when scrolling upwards and have reached the top of the scroll area, also, for a normal mac scrensize the top card doesn't show until you scroll
// TODO: add subsections in responsiblities for Atom

// TODO: check how many skills are duplicated between tracks and consider removing

// TODO: Add gnosisnet and NCR
// TODO: add projects
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
