import { useState, useEffect } from 'react';
import BatteryTwin from '../components/BatteryTwin';
import { Shield, Zap, Thermometer, Database, Cpu, Compass } from 'lucide-react';

export default function TwinPage() {
  const [loadSimulation, setLoadSimulation] = useState('Active EV Drive Cycle');
  const [packTemp, setPackTemp] = useState(28.4);
  const [packSOH, setPackSOH] = useState(96.2);
  const [loadAmps, setLoadAmps] = useState(140.5);

  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate real-time micro-fluctuations in load and temperature
      setLoadAmps(prev => parseFloat((prev + (Math.random() - 0.5) * 8).toFixed(1)));
      setPackTemp(prev => parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1)));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSimTrigger = (type) => {
    setLoadSimulation(type);
    if (type === 'Fast DC Charging') {
      setLoadAmps(-250.0);
      setPackTemp(38.2);
    } else if (type === 'Idle / Cold Soak') {
      setLoadAmps(0.0);
      setPackTemp(18.5);
    } else if (type === 'Dynamic Hill Climb') {
      setLoadAmps(380.0);
      setPackTemp(42.1);
    } else {
      setLoadAmps(140.5);
      setPackTemp(28.4);
    }
  };

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            BATTERY TWIN MONITOR
          </h1>
          <p className="page-subtitle">
            Synchronized live-telemetry mapping and physical simulation interface.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="pulse-dot pulse-dot--healthy" />
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
            PHYSICS TWIN: CONVERGED
          </span>
        </div>
      </div>

      {/* Grid containing Digital Twin centerpiece and simulated metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-lg)' }}>
        
        {/* Centerpiece Twin View */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <BatteryTwin />

          {/* Interactive Simulation Panel */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} style={{ color: 'var(--accent-cyan)' }} />
              PHYSICAL STRESS SIMULATION ENGINE
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Simulate actual physical EV pack workloads to stress test predicting thermal margins, current spikes, and cell imbalances.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn"
                onClick={() => handleSimTrigger('Active EV Drive Cycle')}
                style={{
                  border: loadSimulation === 'Active EV Drive Cycle' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  background: loadSimulation === 'Active EV Drive Cycle' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0,0,0,0.3)',
                }}
              >
                Drive Cycle
              </button>
              <button
                className="btn"
                onClick={() => handleSimTrigger('Fast DC Charging')}
                style={{
                  border: loadSimulation === 'Fast DC Charging' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  background: loadSimulation === 'Fast DC Charging' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0,0,0,0.3)',
                }}
              >
                Fast DC Charge
              </button>
              <button
                className="btn"
                onClick={() => handleSimTrigger('Dynamic Hill Climb')}
                style={{
                  border: loadSimulation === 'Dynamic Hill Climb' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  background: loadSimulation === 'Dynamic Hill Climb' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0,0,0,0.3)',
                }}
              >
                Hill Climb
              </button>
              <button
                className="btn"
                onClick={() => handleSimTrigger('Idle / Cold Soak')}
                style={{
                  border: loadSimulation === 'Idle / Cold Soak' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                  background: loadSimulation === 'Idle / Cold Soak' ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0,0,0,0.3)',
                }}
              >
                Cold Soak
              </button>
            </div>
          </div>
        </div>

        {/* Right side diagnostics column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {/* Twin Profile State */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '12px' }}>
              SIMULATED PROFILE
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="metric-card">
                <span className="data-label">SIMULATED SCENARIO</span>
                <span style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
                  {loadSimulation}
                </span>
              </div>

              <div className="metric-card">
                <span className="data-label">DYNAMIC CURRENT FLOW</span>
                <span className="data-value" style={{ color: loadAmps < 0 ? 'var(--status-healthy)' : '#FFFFFF' }}>
                  {loadAmps > 0 ? `+${loadAmps}` : loadAmps} A
                </span>
              </div>

              <div className="metric-card">
                <span className="data-label">MEAN PACK TEMPERATURE</span>
                <span className="data-value">
                  {packTemp}°C
                </span>
              </div>
            </div>
          </div>

          {/* SOH Degradation Insight */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={16} style={{ color: 'var(--accent-cyan)' }} />
              ELECTRODE DEGRADATION MODEL
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Physical twin algorithms identify active lithium decay and electrolyte degradation curves.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Anode Film Thickening:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>0.012 mm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Lithium Inventory Loss:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--status-warning)' }}>3.41%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Active Material Loss:</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>1.88%</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
