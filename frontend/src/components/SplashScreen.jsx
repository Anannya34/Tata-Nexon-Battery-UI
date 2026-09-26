import React, { useState, useEffect } from 'react';
import { Activity, Cpu, ShieldCheck, Zap, ArrowRight, Radio } from 'lucide-react';

export default function SplashScreen({ onEnter }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('BOOTING BI-OS CORE...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const steps = [
      { p: 15, t: 'INITIALIZING NASA BATTERY AGING TELEMETRY...' },
      { p: 35, t: 'LOADING ENSEMBLE, LSTM & TRANSFORMER MODELS...' },
      { p: 60, t: 'CALIBRATING 3D DIGITAL BATTERY TWIN...' },
      { p: 85, t: 'ESTABLISHING REST API GATEWAY (PORT 8000)...' },
      { p: 100, t: 'SYSTEM ONLINE • BI-OS READY' }
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].p);
        setStatusText(steps[stepIdx].t);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsReady(true);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-overlay">
      <style>{`
        .splash-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background-color: #070709;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
        }

        .splash-card {
          width: 100%;
          max-width: 580px;
          background: rgba(14, 16, 22, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(0, 242, 254, 0.25);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 0 60px rgba(0, 242, 254, 0.12);
          position: relative;
        }

        .splash-glow-ring {
          width: 90px;
          height: 90px;
          margin: 0 auto 24px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 242, 254, 0.15) 0%, transparent 70%);
          border: 2px solid rgba(0, 242, 254, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 30px rgba(0, 242, 254, 0.3);
          animation: pulseGlow 2.5s infinite ease-in-out;
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(0, 242, 254, 0.3); }
          50% { transform: scale(1.06); box-shadow: 0 0 50px rgba(0, 242, 254, 0.6); }
        }

        .splash-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #00F2FE 0%, #0077FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 8px;
        }

        .splash-sub {
          font-size: 0.85rem;
          color: #90A0B0;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .splash-progress-track {
          width: 100%;
          height: 8px;
          background: rgba(10, 12, 16, 0.8);
          border-radius: 10px;
          border: 1px solid rgba(0, 162, 255, 0.15);
          overflow: hidden;
          margin-top: 12px;
        }

        .splash-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #0077FF 0%, #00F2FE 100%);
          border-radius: 10px;
          transition: width 0.4s ease-out;
          box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
        }

        .splash-status-info {
          display: flex;
          justify-content: space-between;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.72rem;
          color: #5D6E7F;
        }

        .splash-status-text {
          color: #00F2FE;
        }

        .btn-launch {
          width: 100%;
          margin-top: 28px;
          padding: 14px 24px;
          background: linear-gradient(135deg, #0077FF 0%, #00F2FE 100%);
          color: #070709;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: 0.95rem;
          letter-spacing: 0.05em;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 0 25px rgba(0, 242, 254, 0.4);
          transition: all 0.2s ease-in-out;
        }

        .btn-launch:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(0, 242, 254, 0.7);
        }
      `}</style>

      {/* Cyber Background Grid */}
      <div className="cyber-background">
        <div className="cyber-grid" />
        <div className="cyber-orbs" />
      </div>

      <div className="splash-card">
        {/* Glowing Central Icon */}
        <div className="splash-glow-ring">
          <Zap size={40} color="#00F2FE" />
        </div>

        {/* Title */}
        <h1 className="splash-title">BATTERY RUL PREDICTION</h1>
        <p className="splash-sub">
          Advanced Predictive Maintenance, Digital Twin Diagnostics & Neural Intelligence
        </p>

        {/* Status & Bar */}
        <div className="splash-status-info">
          <span className="splash-status-text">{statusText}</span>
          <span>{progress}%</span>
        </div>

        <div className="splash-progress-track">
          <div className="splash-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        {/* Launch Button */}
        {isReady && (
          <button onClick={onEnter} className="btn-launch">
            ENTER SYSTEM DASHBOARD <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
