import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ThemeContextProvider } from './context/theme';
import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: Add animation on scroll on resume
// TODO: check mobile layout and add mobile-specific adjustments as needed

// TODO: build page for articles
// TODO: add education (by default in time line view, filter out url based)

// TODO: in skills agregate skills together, ds with ds adption, and remove  category from popup
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
