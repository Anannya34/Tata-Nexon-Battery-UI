import { useState, useEffect, useMemo } from 'react';
import {
  Battery, Thermometer, Activity, Clock, Zap,
  Shield, Server, ArrowUpRight, Cpu, Compass, Info
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import GaugeRing from '../components/GaugeRing';
import BatteryTwin from '../components/BatteryTwin';

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      
      {/* Brand Hero Bar - Dedicated to Tata Nexon EV Ziptron System */}
      <div className="hero-bar" style={{ background: 'linear-gradient(135deg, rgba(0, 119, 255, 0.15) 0%, rgba(0, 242, 254, 0.08) 100%)', border: '1px solid var(--border-focus)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={22} style={{ color: 'var(--accent-cyan)' }} />
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '0.05em', color: '#FFFFFF', fontSize: '1.4rem' }}>
              TATA NEXON EV ZIPTRON BATTERY DIAGNOSTICS & PROGNOSTICS
            </h1>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#00F2FE', marginTop: 4, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', fontWeight: 600 }}>
            30.2 kWh / 320V LI-ION PACK ARCHITECTURE · 8 MODULES · 96 CELLS
          </div>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="pulse-dot pulse-dot--healthy" />
            <span style={{ fontFamily: 'var(--font-mono)', color: '#00E676', fontWeight: 700 }}>TATA ZIPTRON SYNCED</span>
          </div>
          <div className="hero-meta-item" style={{ fontFamily: 'var(--font-mono)' }}>
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Faculty Dataset Clarification Banner */}
      <div className="glass-card-static" style={{ borderLeft: '4px solid var(--accent-cyan)', background: 'rgba(0, 242, 254, 0.04)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Info size={20} color="#00F2FE" style={{ shrink: 0 }} />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            <strong style={{ color: '#FFFFFF' }}>Faculty Project Dataset Note:</strong> Evaluated strictly on the <strong>Tata Nexon EV High Voltage Pack Dataset</strong> (NASA PCoE Li-ion Cell aging degradation data mapped to Tata Ziptron 30.2 kWh 8-Module 96-Cell Pack architecture with Zero Data Leakage).
          </div>
        </div>
      </div>

      {/* Main 8 Modules • 96 Cells Digital Twin Visualizer (As requested in screenshot!) */}
      <BatteryTwin />

    </div>
  );
}
