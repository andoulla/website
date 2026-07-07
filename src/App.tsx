import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ThemeContextProvider } from './context/theme';
import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: Add animation on scroll on resume
// TODO: investigate light options for DB to switch jsons out
// TODO: update content to ensure correct mapping of skills to categories and subcategories
// TODO: build page for articles
// TODO: add education (by default in time line view, filter out url based)
// TODO: add rest of the work history and add the 3 views (full time line, eng. mng/lead role/ snr eng role ) with button to hide eduation on the other 2
// TODO: check lighthouse metrics
// TODO: ATS optimisation

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
          </Routes>
        </BrowserRouter>
      </ResumeDataProvider>
    </ThemeContextProvider>
  );
};

export default App;
