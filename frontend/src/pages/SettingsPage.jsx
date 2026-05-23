import { useState } from 'react';
import { Settings, Server, Database, Bell, ShieldCheck } from 'lucide-react';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:8000');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState('30');
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#FFFFFF' }}>SETTINGS CONTROL</h1>
          <p className="page-subtitle">Configure system parameters, neural API pipeline, and telemetry interval rates.</p>
        </div>
      </div>

      <div style={{ maxWidth: 680, display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        {/* API Endpoint config */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Server size={16} style={{ color: 'var(--accent-cyan)' }} />
              API NEURAL CONNECTION
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: '12px' }}>
            <div className="input-group">
              <label className="input-label">API ENDPOINT LINK</label>
              <input
                className="input-field"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="pulse-dot pulse-dot--healthy" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                CONNECTED · PIPELINE LATENCY: 8ms
              </span>
            </div>
          </div>
        </div>

        {/* Telemetry Refresh */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
              TELEMETRY PULSE CONFIGURATION
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>Real-Time Data Streaming</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Continually poll active cell voltages and thermistors</div>
              </div>
              <button
                className={`btn btn-sm ${autoRefresh ? 'btn-primary' : ''}`}
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>
            {autoRefresh && (
              <div className="input-group">
                <label className="input-label">POLL FREQUENCY RATE</label>
                <select
                  className="input-field"
                  style={{ borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                >
                  <option value="10">10 seconds (High Stress)</option>
                  <option value="30">30 seconds (Optimal Standard)</option>
                  <option value="60">1 minute (Eco Mode)</option>
                  <option value="300">5 minutes (Power Saving)</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Intelligent Alerts Toggle */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Bell size={16} style={{ color: 'var(--accent-cyan)' }} />
              INTELLIGENT FAULT ALERTS
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', color: '#FFFFFF', fontWeight: 600 }}>Failure Prediction Notifications</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Instantly alert control room of thermal runaway risks</div>
            </div>
            <button
              className={`btn btn-sm ${notifications ? 'btn-primary' : ''}`}
              onClick={() => setNotifications(!notifications)}
            >
              {notifications ? 'STREAMING' : 'OFFLINE'}
            </button>
          </div>
        </div>

        {/* System parameters logs */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Settings size={16} style={{ color: 'var(--accent-cyan)' }} />
              AURA PLATFORM SYSTEM SPECS
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            {[
              ['Twin Version', 'v3.0.0 (AURA-TWIN)'],
              ['UI Architecture', 'React + Vite (Glassmorphic)'],
              ['Diagnostic Router', 'FastAPI REST Layer'],
              ['ML Intelligence', 'Ensemble Regressor (XGBoost + Random Forest)'],
              ['Visual Palette', 'Obsidian Cyberpunk Cyber-Theme'],
              ['Sync State', ' converged (physics bound)'],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="data-label" style={{ fontSize: '0.6rem' }}>{label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
