import { useMemo } from 'react';

/**
 * Circular gauge ring for health / performance metrics.
 * @param {number} value  – 0 to 1 (or 0 to max)
 * @param {number} max    – max value (default 1)
 * @param {number} size   – pixel diameter
 * @param {string} label  – bottom label
 * @param {string} status – 'healthy' | 'warning' | 'critical'
 */
export default function GaugeRing({ value = 0, max = 1, size = 140, label, status = 'healthy' }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const offset = circumference * (1 - pct);

  const colorMap = {
    healthy:  'var(--status-healthy)',
    warning:  'var(--status-warning)',
    critical: 'var(--status-critical)',
  };

  const color = colorMap[status] || 'var(--text-secondary)';

  const displayValue = max === 1 ? `${(pct * 100).toFixed(1)}%` : value.toFixed(0);

  return (
    <div 
      className="gauge-ring" 
      style={{ 
        width: size, 
        height: size, 
        position: 'relative', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
    >
      <svg 
        width={size} 
        height={size} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0,
          transform: 'rotate(-90deg)' // Rotate SVG so the gauge starts at the top
        }}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference * 0.04} ${circumference * 0.01}`}
        />
        {/* Value arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div 
        className="gauge-ring-value" 
        style={{ 
          position: 'absolute', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          textAlign: 'center',
          pointerEvents: 'none'
        }}
      >
        <span 
          className="data-value" 
          style={{ 
            fontSize: size * 0.17, 
            fontWeight: 700, 
            fontFamily: 'var(--font-mono)', 
            color: '#FFFFFF', 
            textShadow: `0 0 10px rgba(255,255,255,0.1)` 
          }}
        >
          {displayValue}
        </span>
        {label && (
          <span 
            className="data-label" 
            style={{ 
              fontSize: Math.max(size * 0.06, 9), 
              color: 'var(--text-tertiary)', 
              marginTop: 4,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
