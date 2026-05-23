import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { Activity, Thermometer, Zap, Award } from 'lucide-react';

function generateSOPTrend() {
  const data = [];
  for (let i = 0; i < 60; i++) {
    data.push({
      cycle: i * 10,
      sop: Math.max(0.55, 1.0 - i * 0.006 + Math.random() * 0.015 - 0.0075),
      predicted: Math.max(0.5, 1.0 - i * 0.0065),
      upperCI: Math.min(1.0, 1.0 - i * 0.006 + 0.04),
      lowerCI: Math.max(0.4, 1.0 - i * 0.007 - 0.04),
    });
  }
  return data;
}

function generateCapacityData() {
  const data = [];
  for (let i = 0; i < 40; i++) {
    data.push({
      cycle: i * 15,
      capacity: Math.max(0.65, 1.0 - i * 0.007 + Math.random() * 0.01),
    });
  }
  return data;
}

function generateResistanceData() {
  const data = [];
  for (let i = 0; i < 40; i++) {
    data.push({
      cycle: i * 15,
      Re: 0.04 + i * 0.001 + Math.random() * 0.005,
      Rct: 0.12 + i * 0.002 + Math.random() * 0.008,
    });
  }
  return data;
}

function generateThermalScatter() {
  const data = [];
  for (let i = 0; i < 50; i++) {
    data.push({
      temp: 15 + Math.random() * 30,
      rul: 200 + Math.random() * 700,
      size: 20 + Math.random() * 60,
    });
  }
  return data;
}

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
        {label !== undefined ? `Cycle ${label}` : ''}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(3) : p.value}
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const sopData = useMemo(() => generateSOPTrend(), []);
  const capacityData = useMemo(() => generateCapacityData(), []);
  const resistanceData = useMemo(() => generateResistanceData(), []);
  const thermalData = useMemo(() => generateThermalScatter(), []);

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#FFFFFF' }}>HEALTH ANALYTICS</h1>
          <p className="page-subtitle">Immersive regression trends, predictive confidence intervals, and dynamic thermal mapping.</p>
        </div>
      </div>

      {/* Primary Analytics Row */}
      <div className="grid-2 section">
        
        {/* SOP confidence chart */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Activity size={16} style={{ color: 'var(--accent-cyan)' }} />
              State of Performance & 95% Confidence Bounds
            </span>
            <span className="card-badge">LSTM INFERENCE</span>
          </div>
          
          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sopData}>
                <defs>
                  <linearGradient id="sopAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0, 119, 255, 0.15)" />
                    <stop offset="100%" stopColor="rgba(0, 119, 255, 0)" />
                  </linearGradient>
                  <linearGradient id="ciAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(0, 242, 254, 0.05)" />
                    <stop offset="100%" stopColor="rgba(0, 242, 254, 0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="cycle"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0.4, 1.05]}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Confidence Interval band */}
                <Area
                  type="monotone"
                  dataKey="upperCI"
                  stroke="rgba(0, 242, 254, 0.15)"
                  fill="url(#ciAreaGrad)"
                  strokeDasharray="3 3"
                  name="95% CI Limit"
                />
                
                <Area
                  type="monotone"
                  dataKey="sop"
                  name="Actual SOH"
                  stroke="var(--accent-blue)"
                  strokeWidth={2.5}
                  fill="url(#sopAreaGrad)"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted Regression"
                  stroke="var(--accent-cyan)"
                  strokeWidth={1.5}
                  strokeDasharray="6 4"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capacity wear curves */}
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Award size={16} style={{ color: 'var(--status-warning)' }} />
              Capacity Degradation Lifetime Profile
            </span>
            <span className="card-badge">ACTIVE WEAR</span>
          </div>

          <div className="chart-container" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={capacityData}>
                <defs>
                  <linearGradient id="amberCapGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 179, 0, 0.15)" />
                    <stop offset="100%" stopColor="rgba(255, 179, 0, 0)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="cycle"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0.6, 1.05]}
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="capacity"
                  name="Capacity (Ah)"
                  stroke="var(--status-warning)"
                  strokeWidth={2.5}
                  fill="url(#amberCapGrad)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Internal Impedance + Thermal Sensitivity Scatter */}
      <div className="grid-2 section">
        
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Zap size={16} style={{ color: 'var(--accent-cyan)' }} />
              Electrochemical Impedance Spectroscopy (EIS) Trend
            </span>
            <span className="card-badge">IMPEDANCE</span>
          </div>

          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resistanceData}>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="cycle"
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
                <Line
                  type="monotone"
                  dataKey="Re"
                  name="Re (Electrolyte Resistance)"
                  stroke="var(--text-secondary)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Rct"
                  name="Rct (Charge Transfer Resistance)"
                  stroke="var(--status-critical)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
              <Thermometer size={16} style={{ color: 'var(--status-critical)' }} />
              Temperature vs Remaining Useful Life (RUL) Sensitivity
            </span>
            <span className="card-badge">THERMAL SENSITIVITY</span>
          </div>

          <div className="chart-container" style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid stroke="rgba(255,255,255,0.02)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="temp"
                  name="Temperature"
                  unit="°C"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={{ stroke: 'var(--border-subtle)' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="rul"
                  name="RUL"
                  unit="c"
                  tick={{ fill: 'var(--text-tertiary)', fontSize: 9, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <ZAxis dataKey="size" range={[30, 90]} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div style={{
                        background: 'rgba(7, 9, 13, 0.95)',
                        border: '1px solid var(--border-default)',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.8125rem',
                      }}>
                        <div style={{ color: '#FFFFFF' }}>
                          {payload[0]?.value?.toFixed(1)}°C → {payload[1]?.value?.toFixed(0)}c RUL
                        </div>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={thermalData}
                  fill="rgba(0, 242, 254, 0.25)"
                  stroke="var(--accent-cyan)"
                  strokeWidth={1}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
