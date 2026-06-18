import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Resume } from './views/resume';
// TODO: Add error page

// TODO: remvie look

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Resume />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
