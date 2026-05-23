import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Cpu, Layers, ShieldAlert,
  Settings, Zap, Menu, X, Compass
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'CORE SYSTEM', items: [
    { to: '/',           icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/analytics',  icon: Activity,        text: 'Health Analytics' },
    { to: '/predict',    icon: Cpu,             text: 'Single Prediction' },
    { to: '/batch',      icon: Layers,          text: 'Batch Diagnostics' },
  ]},
  { label: 'BATTERY INTELLIGENCE', items: [
    { to: '/twin',       icon: Compass,         text: 'Digital Twin View' },
    { to: '/risk',       icon: ShieldAlert,     text: 'Risk Intelligence' },
    { to: '/settings',   icon: Settings,        text: 'Settings Control' },
  ]},
];

export default function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
        style={{
          display: 'none',
          position: 'fixed',
          top: '16px',
          left: '16px',
          zIndex: 200,
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(20px)',
        }}
      >
        {mobileOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Zap size={18} />
          </div>
          <div>
            <div className="sidebar-brand-text">AURA-BATTERY</div>
            <div className="sidebar-brand-version">v3.0.0 · DIGITAL TWIN</div>
          </div>
        </div>

        {/* Navigation Link list */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="sidebar-link-icon" style={{ width: '16px', height: '16px' }} />
                  <span>{item.text}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Sync Status / Footer */}
        <div className="sidebar-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px' }}>
            <div className="pulse-dot pulse-dot--healthy" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              TWIN OPERATIONAL
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
