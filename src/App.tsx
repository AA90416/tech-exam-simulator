import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { SettingsProvider } from './context/SettingsContext';
import { Home } from './pages/Home';
import { ExamPage } from './pages/ExamPage';
import { Results } from './pages/Results';
import { Admin } from './pages/Admin';
import { CreateExam } from './pages/CreateExam';
import './App.css';

function App() {
  return (
    <SettingsProvider>
      <ExamProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/exam" element={<ExamPage />} />
            <Route path="/results" element={<Results />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/create" element={<CreateExam />} />
          </Routes>
        </BrowserRouter>
      </ExamProvider>
    </SettingsProvider>
  );
}

export default App;
