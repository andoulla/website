import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { ResumeDataProvider } from './context/resumeData';
import { Resume } from './views/resume';
// TODO: Add error page

// TODO: remvie look

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
