import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

export default function BacktestStrip() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch(`${API_BASE}/backtest`).then(r => r.json()).then(setData).catch(() => {}); }, []);
  if (!data) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 16px', background: '#f0fdf4',
      border: '1px solid #bbf7d0', borderRadius: 8,
    }}>
      <span style={{ color: '#16a34a', fontSize: 14 }}>✅</span>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11 }}>
        <span style={{ color: '#16a34a', fontWeight: 600 }}>Model Validated</span>
        <span style={{ color: '#9ca3af', marginLeft: 8 }}>
          Sept 2024 Backtest · Predicted +{data.predicted_price_change_pct}% vs Actual +{data.actual_price_change_pct}% ·{' '}
        </span>
        <span style={{ color: '#16a34a', fontWeight: 700 }}>Error: {data.model_error_pct}%</span>
        <span style={{ color: '#d1d5db', marginLeft: 8 }}>· Sources: ICAR, NITI Aayog, SEA India, RBI</span>
      </div>
    </div>
  );
}