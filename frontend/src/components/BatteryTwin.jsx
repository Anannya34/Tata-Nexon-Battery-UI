import { useState, useMemo } from 'react';
import { Activity, Thermometer, BatteryCharging, Zap, ShieldCheck } from 'lucide-react';

const MODULES_COUNT = 8;
const CELLS_PER_MODULE = 12;

// Initial state for simulated cells in 8 modules of Tata Nexon EV Pack
function generateInitialCells() {
  const data = [];
  for (let m = 0; m < MODULES_COUNT; m++) {
    const moduleCells = [];
    for (let c = 0; c < CELLS_PER_MODULE; c++) {
      let health = 'healthy';
      let temp = 25 + Math.random() * 6;
      let soc = 86 - Math.random() * 4;
      let voltage = 3.65 + Math.random() * 0.15;
      let soh = 96.5 - Math.random() * 3;

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
      } else if (Math.random() > 0.90) {
        health = 'warning';
        temp = 34.0 + Math.random() * 4;
        soh = 89.5 - Math.random() * 4;
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
      id: `MODULE ${m + 1}`,
      cells: moduleCells,
      status: m === 2 ? 'critical' : m === 5 ? 'warning' : 'healthy',
    });
  }
  return data;
}

export default function BatteryTwin() {
  const [modules, setModules] = useState(generateInitialCells());
  const [selectedCell, setSelectedCell] = useState(modules[1].cells[10]); // M2-C11 from screenshot
  const [selectedModuleIdx, setSelectedModuleIdx] = useState(1);
  const [isCharging, setIsCharging] = useState(true);

  const stats = useMemo(() => {
    let optimal = 87;
    let warning = 8;
    let critical = 1;
    return { optimal, warning, critical };
  }, [modules]);

  const handleCellClick = (cell, moduleIdx) => {
    setSelectedCell(cell);
    setSelectedModuleIdx(moduleIdx);
  };

  const getCellColor = (health) => {
    if (health === 'critical') return '#FF1744'; // Red
    if (health === 'warning') return '#FFB300'; // Amber
    return '#00E676'; // Green
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.75fr', gap: 'var(--space-lg)', alignItems: 'start' }}>
      
      {/* Left 8 Modules • 96 Cells Layout (Matching Screenshot) */}
      <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span className="card-title" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '0.05em', color: '#FFFFFF' }}>
              EV PACK DIGITAL TWIN VISUALIZATION
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="status-badge status-badge--healthy">FLOW ACTIVE</span>
            <span style={{ fontSize: '0.8rem', color: '#00F2FE', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
              8 MODULES · 96 CELLS
            </span>
          </div>
        </div>

        {/* 8 Module Cards Container */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {modules.map((mod, mIdx) => (
            <div
              key={mod.id}
              style={{
                background: mIdx === selectedModuleIdx ? 'rgba(0, 242, 254, 0.08)' : 'rgba(10, 12, 16, 0.6)',
                border: mIdx === selectedModuleIdx ? '1px solid #00F2FE' : '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
                  {mod.id}
                </span>
                <div style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: mod.status === 'critical' ? '#FF1744' : mod.status === 'warning' ? '#FFB300' : '#00E676'
                }} />
              </div>

              {/* 12 Cells Grid Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                {mod.cells.map((cell) => (
                  <div
                    key={cell.id}
                    onClick={() => handleCellClick(cell, mIdx)}
                    title={`${cell.id} - ${cell.soh}% SOH`}
                    style={{
                      height: '24px',
                      borderRadius: '4px',
                      background: getCellColor(cell.health),
                      border: selectedCell?.id === cell.id ? '2px solid #FFFFFF' : 'none',
                      cursor: 'pointer',
                      boxShadow: selectedCell?.id === cell.id ? '0 0 10px #FFFFFF' : 'none',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Telemetry Flow Rate Bar */}
        <div style={{
          display: 'flex', justify: 'space-between', alignItems: 'center',
          background: 'rgba(8, 10, 15, 0.8)', padding: '12px 16px', borderRadius: '10px',
          border: '1px solid var(--border-subtle)', fontSize: '0.78rem'
        }}>
          <div>Telemetry flow rate: <strong style={{ color: '#00F2FE' }}>12.4 Gb/s</strong></div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span style={{ color: '#00E676' }}>● Optimal ({stats.optimal})</span>
            <span style={{ color: '#FFB300' }}>▲ Warn ({stats.warning})</span>
            <span style={{ color: '#FF1744' }}>■ Anomaly ({stats.critical})</span>
          </div>
        </div>
      </div>

      {/* Right Telemetry Column (Matching Screenshot Gauges & Diagnostics) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        
        {/* Real-time Gauges */}
        <div className="glass-card-static" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            REAL-TIME SYSTEM DIAGNOSTIC GAUGES TELEMETRY
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ border: '3px solid #00E676', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', paddingTop: '20px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>94.6%</div>
              <div style={{ fontSize: '0.6rem', color: '#90A0B0', fontWeight: 700 }}>SOH PACK</div>
            </div>

            <div style={{ border: '3px solid #00E676', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', paddingTop: '20px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>97.4%</div>
              <div style={{ fontSize: '0.6rem', color: '#90A0B0', fontWeight: 700 }}>MODEL SYNC</div>
            </div>

            <div style={{ border: '3px solid #FFB300', borderRadius: '50%', width: '90px', height: '90px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyCenter: 'center', paddingTop: '20px' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF' }}>12.0%</div>
              <div style={{ fontSize: '0.6rem', color: '#90A0B0', fontWeight: 700 }}>RISK PROFILE</div>
            </div>
          </div>
        </div>

        {/* Selected Cell Detail Diagnostics Card */}
        <div className="glass-card-static" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
            <div>
              <span style={{ fontSize: '0.68rem', color: '#90A0B0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>DIAGNOSTIC TELEMETRY</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}>
                {selectedCell.id}
              </div>
            </div>
            <span className="status-badge status-badge--healthy" style={{ background: '#00E676', color: '#070709', fontWeight: 700 }}>
              HEALTHY
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justify: 'space-between' }}>
              <span style={{ color: '#90A0B0' }}>Cell Temperature</span>
              <strong style={{ color: '#FFFFFF' }}>31.4°C</strong>
            </div>
            <div style={{ display: 'flex', justify: 'space-between' }}>
              <span style={{ color: '#90A0B0' }}>State of Charge (SOC)</span>
              <strong style={{ color: '#FFFFFF' }}>83.4%</strong>
            </div>
            <div style={{ display: 'flex', justify: 'space-between' }}>
              <span style={{ color: '#90A0B0' }}>Cell Voltage</span>
              <strong style={{ color: '#FFFFFF' }}>3.7 V</strong>
            </div>
            <div style={{ display: 'flex', justify: 'space-between' }}>
              <span style={{ color: '#90A0B0' }}>State of Health (SOH)</span>
              <strong style={{ color: '#00E676' }}>94.6%</strong>
            </div>
            <div style={{ display: 'flex', justify: 'space-between' }}>
              <span style={{ color: '#90A0B0' }}>Cell Impedance</span>
              <strong style={{ color: '#FFFFFF' }}>0.0195 Ω</strong>
            </div>
          </div>

          {/* AI Diagnostics Insight */}
          <div style={{ marginTop: '16px', background: 'rgba(0, 242, 254, 0.05)', border: '1px solid rgba(0, 242, 254, 0.2)', borderRadius: '8px', padding: '12px', fontSize: '0.78rem', color: '#90A0B0' }}>
            <div style={{ color: '#00F2FE', fontWeight: 700, marginBottom: '4px' }}>⚡ AI Diagnostics Insight</div>
            Cell operating within optimal electrochemical limits. Aging slope matches standard model prediction.
          </div>
        </div>

        {/* TATA ZIPTRON FORECAST INTELLIGENCE */}
        <div className="glass-card-static" style={{ padding: '16px', borderLeft: '4px solid #00F2FE', background: 'rgba(0, 242, 254, 0.04)' }}>
          <div style={{ color: '#00F2FE', fontWeight: 700, fontSize: '0.85rem', marginBottom: '6px' }}>
            ⚙️ TATA ZIPTRON FORECAST INTELLIGENCE
          </div>
          <p style={{ fontSize: '0.78rem', color: '#90A0B0', lineHeight: 1.5, margin: 0 }}>
            Ensemble forecaster predicts <strong>92.8% SOH</strong> over the next 150 cycles. Cell block <strong>M3-C5</strong> has triggered an impedance-drift warning alert. Pack balance schedule has been dispatched automatically.
          </p>
        </div>

      </div>
    </div>
  );
}
