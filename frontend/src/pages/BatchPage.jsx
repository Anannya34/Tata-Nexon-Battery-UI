import { useState } from 'react';
import { Upload, Layers, Download, Database, CheckCircle2 } from 'lucide-react';

function getStatusFromRul(rul) {
  if (rul <= 150) return 'critical';
  if (rul <= 400) return 'warning';
  return 'healthy';
}

function generateBatchResults(count = 12) {
  const results = [];
  for (let i = 0; i < count; i++) {
    const capacity = 0.7 + Math.random() * 0.3;
    const rul = Math.max(50, capacity * 900 + Math.random() * 200 - 100);
    const sop = Math.max(0.5, capacity * 0.85 + Math.random() * 0.1);
    results.push({
      battery_id: `AURA-BAT-${String(i + 1).padStart(3, '0')}`,
      rul: parseFloat(rul.toFixed(1)),
      sop: parseFloat(sop.toFixed(4)),
      health_status: getStatusFromRul(rul),
      capacity: parseFloat(capacity.toFixed(3)),
      temperature: parseFloat((20 + Math.random() * 15).toFixed(1)),
    });
  }
  return results;
}

export default function BatchPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  const handleRunBatch = () => {
    setLoading(true);
    setTimeout(() => {
      setResults(generateBatchResults(24));
      setLoading(false);
    }, 1200);
  };

  const filteredResults = results?.filter((r) => {
    if (filter === 'all') return true;
    return r.health_status === filter;
  });

  const summary = results ? {
    total: results.length,
    healthy: results.filter((r) => r.health_status === 'healthy').length,
    warning: results.filter((r) => r.health_status === 'warning').length,
    critical: results.filter((r) => r.health_status === 'critical').length,
  } : null;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#FFFFFF' }}>BATCH DIAGNOSTICS</h1>
          <p className="page-subtitle">Process batch cell parameter tables to identify degraded modules across the entire EV fleet.</p>
        </div>
      </div>

      {/* Controller actions */}
      <div className="glass-card-static section">
        <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
          <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#FFFFFF' }}>
            <Database size={16} style={{ color: 'var(--accent-cyan)' }} />
            TELEMETRY DATAPACK SOURCE
          </span>
          <span className="card-badge">FLEET QUEUE</span>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', marginTop: '12px' }}>
          <label className="btn" style={{ cursor: 'pointer' }}>
            <Upload size={14} style={{ color: 'var(--accent-cyan)' }} />
            UPLOAD CSV DATAPACK
            <input type="file" accept=".csv" style={{ display: 'none' }} />
          </label>

          <button className="btn btn-primary" onClick={handleRunBatch} disabled={loading}>
            <Layers size={14} />
            {loading ? 'BATCH REGRESSION COMPUTING...' : 'RUN INFERENCE ENGINE'}
          </button>

          {results && (
            <button className="btn" style={{ marginLeft: 'auto' }}>
              <Download size={14} />
              EXPORT REPORT
            </button>
          )}
        </div>
      </div>

      {/* Processing Status Shimmer */}
      {loading && (
        <div className="glass-card-static animate-pulse" style={{ padding: '24px', textAlign: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
            SOLVING NEURAL NETWORK BOUNDS...
          </span>
        </div>
      )}

      {/* Summary Row */}
      {summary && (
        <div className="grid-4 section">
          <div className="glass-card metric-card">
            <span className="data-label">TOTAL DIAGNOSED</span>
            <span className="data-value">{summary.total}</span>
          </div>
          <div className="glass-card metric-card">
            <span className="data-label" style={{ color: 'var(--status-healthy)' }}>OPTIMAL STATE</span>
            <span className="data-value" style={{ color: 'var(--status-healthy)' }}>{summary.healthy}</span>
          </div>
          <div className="glass-card metric-card">
            <span className="data-label" style={{ color: 'var(--status-warning)' }}>WARN ALERTS</span>
            <span className="data-value" style={{ color: 'var(--status-warning)' }}>{summary.warning}</span>
          </div>
          <div className="glass-card metric-card">
            <span className="data-label" style={{ color: 'var(--status-critical)' }}>CRITICAL FAULTS</span>
            <span className="data-value" style={{ color: 'var(--status-critical)' }}>{summary.critical}</span>
          </div>
        </div>
      )}

      {/* Results Ledger */}
      {results && (
        <div className="glass-card-static">
          <div className="card-header" style={{ borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
            <span className="card-title" style={{ fontWeight: 700, color: '#FFFFFF' }}>FLEET INFERENCE RECORDS</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['all', 'healthy', 'warning', 'critical'].map((f) => (
                <button
                  key={f}
                  className="btn"
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    border: filter === f ? '1px solid var(--accent-cyan)' : '1px solid var(--border-default)',
                    background: filter === f ? 'rgba(0, 242, 254, 0.05)' : 'rgba(0,0,0,0.3)',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <table className="data-table" style={{ marginTop: '8px' }}>
            <thead>
              <tr>
                <th>Cell node ID</th>
                <th>RUL utility (Cycles)</th>
                <th>Performance (SOP)</th>
                <th>Capacity (Ah)</th>
                <th>Temp (°C)</th>
                <th>Alert Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults?.map((r) => (
                <tr key={r.battery_id}>
                  <td className="mono-cell" style={{ fontWeight: 600, color: '#FFFFFF' }}>{r.battery_id}</td>
                  <td className="mono-cell" style={{ color: 'var(--accent-cyan)' }}>{r.rul.toFixed(0)}c</td>
                  <td className="mono-cell">{(r.sop * 100).toFixed(1)}%</td>
                  <td className="mono-cell">{r.capacity.toFixed(3)}</td>
                  <td className="mono-cell">{r.temperature}°C</td>
                  <td>
                    <span className={`status-badge status-badge--${r.health_status}`}>
                      <span className={`pulse-dot pulse-dot--${r.health_status}`} />
                      {r.health_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!results && !loading && (
        <div className="glass-card-static" style={{ marginTop: 'var(--space-md)' }}>
          <div className="empty-state">
            <Layers size={48} className="empty-state-icon" style={{ color: 'var(--accent-cyan)' }} />
            <div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 700 }}>QUEUED DATAPACK EMPTY</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>Upload cell parameter telemetry files or click run above.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
