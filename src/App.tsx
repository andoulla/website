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
import { Articles } from './views/articles';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: update content to ensure correct mapping of skills to categories and subcategories
// TODO: add rest of the work history and add the 3 views (full timeline, eng. mng/lead role/ snr eng role ) with button to hide eduation on the other 2
// TODO: ATS optimisation
// TODO: add hidden tech stack for elsevier and capco
// TODO: looking into query libs
// TODO: looking into caching
const CareerDataLayout = () => (
  <ErrorBoundary
    fallback={() => (
      <PageContainer>
        <Stack sx={{ py: 8, alignItems: 'center', gap: 1.5 }}>
          <ErrorIcon color="error" fontSize="large" />
          <Typography color="text.secondary">Something went wrong loading this page.</Typography>
          <Button startIcon={<RefreshIcon />} onClick={() => window.location.reload()}>
            Refresh
          </Button>
        </Stack>
      </PageContainer>
    )}
  >
    <CareerDataContextProvider>
      <Outlet />
    </CareerDataContextProvider>
  </ErrorBoundary>
);

const App = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route element={<CareerDataLayout />}>
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
