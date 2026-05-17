import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ExamProvider } from './context/ExamContext';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { ExamPage } from './pages/ExamPage';
import { Results } from './pages/Results';
import { Admin } from './pages/Admin';
import { CreateExam } from './pages/CreateExam';
import { Login } from './pages/Login';
import './App.css';

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/exam" element={<ExamPage />} />
      <Route path="/results" element={<Results />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/create" element={<CreateExam />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ExamProvider>
          <BrowserRouter>
            <ProtectedRoutes />
          </BrowserRouter>
        </ExamProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
