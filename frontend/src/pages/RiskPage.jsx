import { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, ShieldCheck, Thermometer, Zap } from 'lucide-react';
import GaugeRing from '../components/GaugeRing';

const riskData = [
  {
    id: 'AURA-BAT-012',
    risk: 0.87,
    level: 'High',
    rul: 98,
    sop: 0.62,
    status: 'critical',
    issue: 'Severe localized anode degradation — electrolyte loss detected',
    urgency: 'Immediate',
    recommendation: 'Halt active load balancing. Schedule cells replacement within 24 hours.',
  },
  {
    id: 'AURA-BAT-007',
    risk: 0.52,
    level: 'Medium',
    rul: 312,
    sop: 0.78,
    status: 'warning',
    issue: 'Cathode charge transfer impedance drift - thermal hot spot potential',
    urgency: 'Planned',
    recommendation: 'Schedule thermal pad optimization. Cap load threshold to 85% capacity.',
  },
  {
    id: 'AURA-BAT-019',
    risk: 0.41,
    level: 'Medium',
    rul: 356,
    sop: 0.81,
    status: 'warning',
    issue: 'Operating temperature consistently above 41°C',
    urgency: 'Planned',
    recommendation: 'Improve localized cooling. Increase sensor sampling rates to 50Hz.',
  },
  {
    id: 'AURA-BAT-001',
    risk: 0.12,
    level: 'Low',
    rul: 842,
    sop: 0.95,
    status: 'healthy',
    issue: 'Optimal wear slope matched to prediction curve',
    urgency: 'Routine',
    recommendation: 'Maintain continuous telemetry synchronization.',
  },
  {
    id: 'AURA-BAT-003',
    risk: 0.08,
    level: 'Low',
    rul: 924,
    sop: 0.97,
    status: 'healthy',
    issue: 'Normal electrochemical inventory distribution',
    urgency: 'Routine',
    recommendation: 'No operation guidelines required.',
  },
];

const urgencyColors = {
  Immediate: 'var(--status-critical)',
  Planned: 'var(--status-warning)',
  Routine: 'var(--status-healthy)',
};

export default function RiskPage() {
  const fleetRisk = useMemo(() => {
    const avg = riskData.reduce((acc, d) => acc + d.risk, 0) / riskData.length;
    return avg;
  }, []);

  const criticalCount = riskData.filter((d) => d.status === 'critical').length;
  const warningCount = riskData.filter((d) => d.status === 'warning').length;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: '#FFFFFF' }}>RISK INTELLIGENCE</h1>
          <p className="page-subtitle">Real-time electrochemical failure analysis, current anomalies, and diagnostic recommendations.</p>
        </div>
      </div>

      {/* Overview dials & cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'var(--space-lg)' }}>
        
        {/* Left: Overall Risk dial */}
        <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
          <GaugeRing
            value={fleetRisk}
            max={1}
            size={160}
            label="Fleet Risk Score"
            status={fleetRisk > 0.5 ? 'critical' : fleetRisk > 0.3 ? 'warning' : 'healthy'}
          />
          <span className="data-label" style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
            OVERALL CORRELATION PROFILE
          </span>
        </div>

        {/* Right: Anomaly alert summaries */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={32} style={{ color: 'var(--status-critical)' }} />
              <div>
                <h4 style={{ color: '#FFFFFF' }}>CRITICAL ANOMALIES DETECTED</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Electrode resistance threshold exceeded on active modules.</p>
              </div>
            </div>
            <span className="data-value" style={{ color: 'var(--status-critical)' }}>{criticalCount}</span>
          </div>

          <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <AlertTriangle size={32} style={{ color: 'var(--status-warning)' }} />
              <div>
                <h4 style={{ color: '#FFFFFF' }}>WARNING WEAR THRESHOLDS</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Sub-optimal charge balancing schedule recommended.</p>
              </div>
            </div>
            <span className="data-value" style={{ color: 'var(--status-warning)' }}>{warningCount}</span>
          </div>
        </div>

      </div>

      {/* Detailed Risk Ledger */}
      <div className="section">
        <div className="section-title" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={16} style={{ color: 'var(--accent-cyan)' }} />
          ELECTROCHEMICAL ALERT RECORDS & FAULT INTELLIGENCE
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          {riskData.map((item) => (
            <div
              key={item.id}
              className="glass-card-static"
              style={{
                borderLeft: `3px solid ${
                  item.status === 'critical'
                    ? 'var(--status-critical)'
                    : item.status === 'warning'
                    ? 'var(--status-warning)'
                    : 'var(--border-subtle)'
                }`,
                background: 'linear-gradient(135deg, rgba(14,16,22,0.6) 0%, rgba(5,6,8,0.9) 100%)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', flexWrap: 'wrap' }}>
                
                {/* Information */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                      {item.id}
                    </span>
                    <span className={`status-badge status-badge--${item.status}`}>
                      {item.level} Risk
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.65rem',
                        color: urgencyColors[item.urgency],
                        fontWeight: 700,
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.urgency.toUpperCase()}
                    </span>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
                    {item.issue}
                  </p>

                  <div className="recommendation-item" style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '4px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {item.status === 'healthy' ? (
                      <ShieldCheck size={14} style={{ color: 'var(--status-healthy)', flexShrink: 0 }} />
                    ) : (
                      <AlertTriangle size={14} style={{ color: urgencyColors[item.urgency], flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.recommendation}</span>
                  </div>
                </div>

                {/* KPI block metrics */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <span className="data-label" style={{ fontSize: '0.6rem' }}>RISK</span>
                    <div className="data-value" style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{(item.risk * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className="data-label" style={{ fontSize: '0.6rem' }}>RUL</span>
                    <div className="data-value" style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)' }}>{item.rul}c</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span className="data-label" style={{ fontSize: '0.6rem' }}>SOP</span>
                    <div className="data-value" style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>{(item.sop * 100).toFixed(0)}%</div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
