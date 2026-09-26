import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Cpu, Layers, ShieldAlert,
  Settings, Zap, Menu, X, Compass
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'TATA NEXON CORE', items: [
    { to: '/',           icon: LayoutDashboard, text: 'Dashboard Overview' },
    { to: '/twin',       icon: Compass,         text: '8-Module Pack Twin' },
    { to: '/analytics',  icon: Activity,        text: 'Nexon Telemetry' },
    { to: '/predict',    icon: Cpu,             text: 'Nexon ML Prediction' },
    { to: '/batch',      icon: Layers,          text: 'Batch Diagnostics' },
  ]},
  { label: 'BATTERY INTELLIGENCE', items: [
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
          <div className="sidebar-brand-icon" style={{ background: 'linear-gradient(135deg, #0077FF 0%, #00F2FE 100%)' }}>
            <Zap size={18} color="#070709" />
          </div>
          <div>
            <div className="sidebar-brand-text" style={{ color: '#00F2FE', fontWeight: 800 }}>TATA NEXON EV</div>
            <div className="sidebar-brand-version">ZIPTRON 30.2 kWh PACK</div>
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
            <span style={{ fontSize: '0.7rem', color: '#00E676', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
              TATA ZIPTRON SYNCED
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
