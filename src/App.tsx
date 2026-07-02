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
// TODO: update data using the script
// TODO: build page for articles
// TODO: finish skills to have themed colours
// TODO: add education (by default in time line view, filter out url based)
// TODO: move skills to a centralise data file
// TODO: remove company title from recommender
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
