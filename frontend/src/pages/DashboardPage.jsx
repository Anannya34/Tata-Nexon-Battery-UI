import { useState, useEffect, useMemo } from 'react';
import {
  Battery, Thermometer, Activity, Clock, Zap,
  Shield, Server, ArrowUpRight, Cpu, Compass
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import MetricCard from '../components/MetricCard';
import GaugeRing from '../components/GaugeRing';
import BatteryTwin from '../components/BatteryTwin';

function generateFleetData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    data.push({
      day: `Day ${i + 1}`,
      rul: Math.max(200, 850 - i * 15 + Math.random() * 40 - 20),
      sop: Math.max(0.65, 0.98 - i * 0.008 + Math.random() * 0.02 - 0.01),
    });
  }
  return data;
}

function generateDistribution() {
  return [
    { range: '0-100', count: 2, status: 'critical' },
    { range: '100-200', count: 4, status: 'critical' },
    { range: '200-400', count: 8, status: 'warning' },
    { range: '400-600', count: 15, status: 'healthy' },
    { range: '600-800', count: 22, status: 'healthy' },
    { range: '800-1000', count: 18, status: 'healthy' },
  ];
}

const recentPredictions = [
  { id: 'BAT-001', rul: 842, sop: 0.95, status: 'healthy',  time: '2 min ago' },
  { id: 'BAT-007', rul: 312, sop: 0.78, status: 'warning',  time: '5 min ago' },
  { id: 'BAT-003', rul: 924, sop: 0.97, status: 'healthy',  time: '12 min ago' },
  { id: 'BAT-012', rul: 98,  sop: 0.62, status: 'critical', time: '18 min ago' },
  { id: 'BAT-005', rul: 671, sop: 0.89, status: 'healthy',  time: '25 min ago' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(7, 9, 13, 0.95)',
      border: '1px solid var(--border-default)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '0.8125rem',
      boxShadow: '0 0 15px rgba(0, 242, 254, 0.1)',
      backdropFilter: 'blur(20px)',
    }}>
      <div style={{ color: 'var(--text-tertiary)', marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: '0.6875rem' }}>
        {label}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
          {p.name}: {typeof p.value === 'number' && p.value < 1 ? (p.value * 100).toFixed(1) + '%' : p.value?.toFixed?.(0) ?? p.value}
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const trendData = useMemo(() => generateFleetData(), []);
  const distData = useMemo(() => generateDistribution(), []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fleetHealth = 0.946;
  const avgRUL = 624;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Brand Hero Bar */}
      <div className="hero-bar">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={18} style={{ color: 'var(--accent-cyan)', animation: 'spin 8s linear infinite' }} />
            <h1 className="hero-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '0.05em', color: '#FFFFFF' }}>
              AURA BATTERY OPERATING SYSTEM
            </h1>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
            PREDICTIVE LITHIUM TWIN & DEGRADATION FORECASTER
          </div>
        </div>
        <div className="hero-meta">
          <div className="hero-meta-item">
            <div className="pulse-dot pulse-dot--healthy" />
            <span style={{ fontFamily: 'var(--font-mono)' }}>CORE SYNCED</span>
          </div>
          <div className="hero-meta-item">
            <Server size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span className="mono" style={{ color: '#FFFFFF' }}>ENSEMBLE-XGBoost</span>
          </div>
          <div className="hero-meta-item">
            <Clock size={14} style={{ color: 'var(--text-tertiary)' }} />
            <span className="mono">{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid-4 section" style={{ marginBottom: 0 }}>
        <MetricCard
          label="Fleet Health Index"
          value={(fleetHealth * 100).toFixed(1)}
          unit="%"
          delta="Optimized"
          deltaType="positive"
          icon={Shield}
        />
        <MetricCard
          label="Average Lifetime Remaining"
          value={avgRUL}
          unit="cycles"
          delta="Normal Wear"
          deltaType="positive"
          icon={Battery}
        />
        <MetricCard
          label="Telemetry Nodes"
          value="96"
          delta="Live Twin Sync"
          deltaType="positive"
          icon={Zap}
        />
        <MetricCard
          label="Confidence Bounds"
          value="97.4"
          unit="%"
          delta="±1.1% CI"
          deltaType="neutral"
          icon={Activity}
        />
      </div>

      {/* Centerpiece 3D Twin & Diagnostic visualizers */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.3fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
        <BatteryTwin />

        {/* Live System Log & AI layer */}
        <div className="glass-card-static" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ fontWeight: 700, color: '#FFFFFF' }}>REAL-TIME SYSTEM DIAGNOSTIC GAUGES</span>
            <span className="card-badge">TELEMETRY</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-around', padding: '10px 0' }}>
            <GaugeRing value={fleetHealth} max={1} size={110} label="SOH Pack" status="healthy" />
            <GaugeRing value={0.974} max={1} size={110} label="Model Sync" status="healthy" />
            <GaugeRing value={0.12} max={1} size={110} label="Risk Profile" status="warning" />
          </div>

          <div className="divider" style={{ margin: '8px 0' }} />

          {/* AI Assistant Insight Dock */}
          <div
            style={{
              padding: '14px',
              background: 'rgba(0, 119, 255, 0.03)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
              <Cpu size={14} />
              <span>AURA SYSTEM FORECAST INTELLIGENCE</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Ensemble forecaster predicts <strong>92.8% SOH</strong> over the next 150 cycles. Cell block <strong>M3-C5</strong> has triggered an impedance-drift warning alert. Pack balance schedule has been dispatched automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Analytics / Forecast Charts */}
      <div className="grid-2 section">
        
        {/* RUL Decay Trend */}
        <div className="glass-card-static">
          <div className="card-header">
            <span className="card-title">Electrode Wear Trend & Forecast Bounds</span>
            <span className="card-badge">30 DAY HISTORY</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="cyberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0, 242, 254, 0.25)" />
                    <stop offset="100%" stopColor="rgba(0, 242, 254, 0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                  interval={4}
                />
                <YAxis
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rul"
                  name="RUL (cycles)"
                  stroke="var(--accent-cyan)"
                  strokeWidth={2}
                  fill="url(#cyberGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'var(--accent-cyan)', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet RUL distribution */}
        <div className="glass-card-static">
          <div className="card-header">
            <span className="card-title">RUL Distribution Analytics</span>
            <span className="card-badge">TOTAL FLEET</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} barSize={28}>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="range"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Pack count"
                  radius={[4, 4, 0, 0]}
                  fill="var(--accent-blue)"
                  opacity={0.8}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent Predictions Feed */}
      <div className="glass-card-static">
        <div className="card-header">
          <span className="card-title">Live Diagnostic Ledger</span>
          <span className="card-badge">REAL-TIME TELEMETRY</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Battery Node ID</th>
              <th>Remaining Utility (Cycles)</th>
              <th>State of Performance (SOP)</th>
              <th>Physical Status</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {recentPredictions.map((p) => (
              <tr key={p.id}>
                <td className="mono-cell" style={{ fontWeight: 600, color: '#FFFFFF' }}>{p.id}</td>
                <td className="mono-cell" style={{ color: 'var(--accent-cyan)' }}>{p.rul}c</td>
                <td className="mono-cell">{(p.sop * 100).toFixed(1)}%</td>
                <td>
                  <span className={`status-badge status-badge--${p.status}`}>
                    <span className={`pulse-dot pulse-dot--${p.status}`} />
                    {p.status}
                  </span>
                </td>
                <td style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{p.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
