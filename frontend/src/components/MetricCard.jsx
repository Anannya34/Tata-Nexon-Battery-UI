/**
 * Glass-style metric card.
 */
export default function MetricCard({ label, value, unit, delta, deltaType = 'neutral', icon: Icon }) {
  return (
    <div className="glass-card metric-card animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="data-label">{label}</span>
        {Icon && (
          <Icon
            size={16}
            style={{ color: 'var(--text-muted)', opacity: 0.5 }}
          />
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span className="data-value">{value}</span>
        {unit && <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{unit}</span>}
      </div>
      {delta !== undefined && (
        <span className={`metric-delta metric-delta--${deltaType}`}>
          {deltaType === 'positive' ? '↑' : deltaType === 'negative' ? '↓' : '·'} {delta}
        </span>
      )}
    </div>
  );
}
