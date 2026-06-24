import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
// TODO: Add error page
// TODO: Add animation on scroll
// TODO: check mobile layout and add mobile-specific adjustments as needed
// TODO: check accessibility
// TODO: check for unnecessary re-renders and performance

function App() {
  return (
    <ResumeDataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Resume />} />
        </Routes>
      </BrowserRouter>
    </ResumeDataProvider>
  );
}

export default App;
