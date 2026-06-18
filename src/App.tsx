import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Resume } from './views/resume';
// TODO: Add error page
// TODO: add a 404 page
// TODO: remvie look
// TODO add semantic commits

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
