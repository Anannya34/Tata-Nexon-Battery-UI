import { useState, useMemo } from 'react';
import { Activity, Thermometer, BatteryCharging, Zap } from 'lucide-react';

const MODULES_COUNT = 8;
const CELLS_PER_MODULE = 12;

// Initial state for simulated cells in 8 modules
function generateInitialCells() {
  const data = [];
  for (let m = 0; m < MODULES_COUNT; m++) {
    const moduleCells = [];
    for (let c = 0; c < CELLS_PER_MODULE; c++) {
      // Create some degraded and critical cells for realism
      let health = 'healthy';
      let temp = 24 + Math.random() * 8;
      let soc = 88 - Math.random() * 5;
      let voltage = 3.7 + Math.random() * 0.2;
      let soh = 98 - Math.random() * 4;

      if (m === 2 && c === 4) {
        health = 'critical';
        temp = 48.5;
        soc = 72.1;
        voltage = 3.22;
        soh = 76.5;
      } else if (m === 5 && c === 8) {
        health = 'warning';
        temp = 39.2;
        soc = 81.4;
        voltage = 3.48;
        soh = 88.0;
      } else if (Math.random() > 0.92) {
        health = 'warning';
        temp = 35.0 + Math.random() * 5;
        soh = 89 - Math.random() * 5;
      }

      moduleCells.push({
        id: `M${m+1}-C${c+1}`,
        health,
        temp: parseFloat(temp.toFixed(1)),
        soc: parseFloat(soc.toFixed(1)),
        voltage: parseFloat(voltage.toFixed(2)),
        soh: parseFloat(soh.toFixed(1)),
        impedance: parseFloat((0.012 + Math.random() * 0.008).toFixed(4)),
      });
    }
    data.push({
      id: `Module ${m + 1}`,
      cells: moduleCells,
      status: m === 2 ? 'critical' : m === 5 ? 'warning' : 'healthy',
    });
  }
  return data;
}

export default function BatteryTwin() {
  const [modules, setModules] = useState(generateInitialCells());
  const [selectedCell, setSelectedCell] = useState(modules[2].cells[4]);
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(2);
  const [isCharging, setIsCharging] = useState(true);

  const stats = useMemo(() => {
    let optimal = 0;
    let warning = 0;
    let critical = 0;
    modules.forEach((mod) => {
      mod.cells.forEach((cell) => {
        if (cell.health === 'healthy') optimal++;
        else if (cell.health === 'warning') warning++;
        else if (cell.health === 'critical') critical++;
      });
    });
    return { optimal, warning, critical };
  }, [modules]);

  const handleCellClick = (cell, moduleIdx) => {
    setSelectedCell(cell);
    setSelectedModuleIdx(moduleIdx);
  };

  const getCellColor = (health) => {
    if (health === 'critical') return 'var(--status-critical)';
    if (health === 'warning') return 'var(--status-warning)';
    return 'var(--status-healthy)';
  };

  return (
    <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', overflow: 'hidden' }}>
      <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
          <span className="card-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '0.05em', color: '#FFFFFF' }}>
            EV PACK DIGITAL TWIN VISUALIZATION
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className={`status-badge ${isCharging ? 'status-badge--healthy' : 'status-badge--warning'}`}
            style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => setIsCharging(!isCharging)}
          >
            <BatteryCharging size={12} className={isCharging ? 'animate-pulse' : ''} />
            {isCharging ? 'FLOW ACTIVE' : 'SYSTEM IDLE'}
          </button>
          <span className="card-badge">8 MODULES · 96 CELLS</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: 'var(--space-lg)' }}>
        
        {/* Left Side: Modular grid of cell packs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            {modules.map((mod, mIdx) => (
              <div
                key={mod.id}
                className="glass-card"
                style={{
                  padding: '12px',
                  border: selectedModuleIdx === mIdx ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                  background: selectedModuleIdx === mIdx ? 'rgba(0, 242, 254, 0.03)' : 'var(--bg-card)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {mod.id.toUpperCase()}
                  </span>
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: getCellColor(mod.status),
                      boxShadow: `0 0 8px ${getCellColor(mod.status)}`,
                    }}
                  />
                </div>
                
                {/* Cells array in module */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
                  {mod.cells.map((cell) => (
                    <button
                      key={cell.id}
                      onClick={() => handleCellClick(cell, mIdx)}
                      style={{
                        aspectRatio: '1',
                        border: selectedCell?.id === cell.id ? '2px solid #FFFFFF' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '3px',
                        background: getCellColor(cell.health),
                        opacity: cell.health === 'healthy' ? 0.75 : 0.95,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: selectedCell?.id === cell.id ? `0 0 10px ${getCellColor(cell.health)}` : 'none',
                      }}
                      title={cell.id}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Flow indicator strip */}
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
              <Zap size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span>Telemetry flow rate:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#FFFFFF' }}>12.4 Gb/s</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', fontFamily: 'var(--font-mono)' }}>
              <span style={{ color: 'var(--status-healthy)' }}>● Optimal ({stats.optimal})</span>
              <span style={{ color: 'var(--status-warning)' }}>▲ Warn ({stats.warning})</span>
              <span style={{ color: 'var(--status-critical)' }}>■ Anomaly ({stats.critical})</span>
            </div>
          </div>
        </div>

        {/* Right Side: Zoomed-in telemetry card */}
        {selectedCell && (
          <div
            className="glass-card animate-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-md)',
              border: `1px solid ${getCellColor(selectedCell.health)}`,
              background: `linear-gradient(180deg, rgba(14,16,22,0.85) 0%, rgba(0,0,0,0.95) 100%)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.625rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>
                  DIAGNOSTIC TELEMETRY
                </span>
                <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  {selectedCell.id}
                </h4>
              </div>
              <span className={`status-badge status-badge--${selectedCell.health}`}>
                {selectedCell.health}
              </span>
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cell Temperature</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: selectedCell.temp > 45 ? 'var(--status-critical)' : '#FFFFFF' }}>
                  <Thermometer size={14} />
                  {selectedCell.temp}°C
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>State of Charge (SOC)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>
                  {selectedCell.soc}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cell Voltage</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>
                  {selectedCell.voltage} V
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>State of Health (SOH)</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>
                  {selectedCell.soh}%
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cell Impedance</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#FFFFFF' }}>
                  {selectedCell.impedance} Ω
                </span>
              </div>
            </div>

            <div className="divider" style={{ margin: '8px 0' }} />

            {/* Micro AI insight widget */}
            <div
              style={{
                padding: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.75rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--accent-cyan)', marginBottom: '4px' }}>
                <Activity size={12} />
                <span>AI Diagnostics Insight</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {selectedCell.health === 'critical'
                  ? 'CRITICAL WARNING: Severe localized hot spot. Thermistor indicates thermal runaway risk. Relieve load load immediately.'
                  : selectedCell.health === 'warning'
                  ? 'ALERT: High resistance drift detected. Schedule module level charge balancing during the next maintenance cycle.'
                  : 'Cell operating within optimal electrochemical limits. Aging slope matches standard model prediction.'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
