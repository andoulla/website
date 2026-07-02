import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ThemeContextProvider } from './context/theme';
import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: Add animation on scroll
// TODO: check mobile layout and add mobile-specific adjustments as needed
// TODO: check for unnecessary re-renders and performance
// TODO: ensure that sensitive data is not stored in repo
// TODO: build page for articles
// TODO: add education (by default in time line view, filter out url based)
// TODO: remove company title from recommender
// TODO: put recommender on the top
// TODO: prefer arrow functions were possible, if not comment why on top of function
// TODO: linting rule to avoid wrong imports from same level
function App() {
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
}

export default App;
