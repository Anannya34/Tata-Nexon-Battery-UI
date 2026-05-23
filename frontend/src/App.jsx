import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import AnalyticsPage from './pages/AnalyticsPage';
import BatchPage from './pages/BatchPage';
import RiskPage from './pages/RiskPage';
import SettingsPage from './pages/SettingsPage';
import TwinPage from './pages/TwinPage';

export default function App() {
  return (
    <div className="app-layout">
      {/* Dynamic Cybernetic particle backdrop layer */}
      <div className="cyber-background">
        <div className="cyber-grid" />
        <div className="cyber-orbs" />
      </div>

      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/predict" element={<PredictionPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/batch" element={<BatchPage />} />
          <Route path="/twin" element={<TwinPage />} />
          <Route path="/risk" element={<RiskPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  );
}
