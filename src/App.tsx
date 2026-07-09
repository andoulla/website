import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ThemeContextProvider } from './context/theme';
import { ResumeDataProvider } from './context/resumeData';
import { Articles } from './views/articles';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: update content to ensure correct mapping of skills to categories and subcategories
// TODO: add rest of the work history and add the 3 views (full timeline, eng. mng/lead role/ snr eng role ) with button to hide eduation on the other 2
// TODO: ATS optimisation
// TODO: add hidden tech stack for elsevier and capco
// TODO: missing coding/programming as a skill
// TODO: switch career provider to use .provider patterh
const ResumeDataLayout = () => (
  <ResumeDataProvider>
    <Outlet />
  </ResumeDataProvider>
);

const App = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route element={<ResumeDataLayout />}>
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
