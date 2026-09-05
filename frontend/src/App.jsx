import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import './index.css';

function App() {
  const userId = localStorage.getItem('questlog_user_id');

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          <Route path="/" element={userId ? <Navigate to="/dashboard" /> : <Navigate to="/onboarding" />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={userId ? <DashboardPage /> : <Navigate to="/onboarding" />} />
          <Route path="/calendar" element={userId ? <CalendarPage /> : <Navigate to="/onboarding" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
