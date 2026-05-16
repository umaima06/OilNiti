import { useState, useEffect } from 'react';

export default function BacktestStrip() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/backtest')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '8px 16px',
      background: 'rgba(16,185,129,0.06)',
      border: '1px solid rgba(16,185,129,0.2)',
      borderRadius: 8,
    }}>
      <span style={{ color: '#10b981', fontSize: 14 }}>✅</span>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 }}>
        <span style={{ color: '#10b981', fontWeight: 600 }}>Model Validated</span>
        <span style={{ color: 'rgba(255,255,255,0.3)', marginLeft: 8 }}>
          Sept 2024 Backtest · Predicted +{data.predicted_price_change_pct}% vs Actual +{data.actual_price_change_pct}% ·{' '}
        </span>
        <span style={{ color: '#10b981', fontWeight: 700 }}>Error: {data.model_error_pct}%</span>
        <span style={{ color: 'rgba(255,255,255,0.2)', marginLeft: 8 }}>
          · Sources: ICAR, NITI Aayog, SEA India, RBI
        </span>
      </div>
    </div>
  );
}