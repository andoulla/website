import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ThemeContextProvider } from './context/theme';
import { ResumeDataProvider } from './context/resumeData';
import { Articles } from './views/articles';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: investigate light options for DB to switch jsons out
// TODO: update content to ensure correct mapping of skills to categories and subcategories
// TODO: add education (by default in time line view, filter out url based)
// TODO: add rest of the work history and add the 3 views (full time line, eng. mng/lead role/ snr eng role ) with button to hide eduation on the other 2
// TODO: check lighthouse metrics
// TODO: ATS optimisation
// TODO: link category-level filtering from Resume (currently only individual skill chips link out, via ?skill=)
// TODO: add hidden tech stack for elsevier and capco
// TODO: check contrast between pink and dark mode
// TODO: scope ResumeDataProvider down to Resume+Skills routes only, not app-wide (needs nested routes with <Outlet>)

const App = () => {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <ResumeDataProvider>
        <BrowserRouter>
          <NavBar />
          <Routes>
            <Route path="/" element={<Resume />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/articles" element={<Articles />} />
          </Routes>
        </BrowserRouter>
      </ResumeDataProvider>
    </ThemeContextProvider>
  );
};

export default App;
