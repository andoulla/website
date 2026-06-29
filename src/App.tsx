import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { NavBar } from './components/navBar';
import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
import { Skills } from './views/skills';

// TODO: Add animation on scroll
// TODO: check mobile layout and add mobile-specific adjustments as needed
// TODO: check accessibility
// TODO: check for unnecessary re-renders and performance

function App() {
  return (
    <ResumeDataProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Resume />} />
          <Route path="/skills" element={<Skills />} />
        </Routes>
      </BrowserRouter>
    </ResumeDataProvider>
  );
}

export default App;
