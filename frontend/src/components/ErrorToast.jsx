//ErrorToast.jsx
import React, { useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

const ErrorToast = () => {
  const { error, clearError } = useSimulation();
  useEffect(() => { if (!error) return; const t = setTimeout(clearError, 6000); return () => clearTimeout(t); }, [error, clearError]);
  if (!error) return null;

  return (
    <div className="toast" role="alert" aria-live="assertive" style={{
      position: 'fixed', bottom: 72, right: 24, zIndex: 9999, maxWidth: 420,
      background: '#fff', border: '1px solid #fecaca', borderLeft: '3px solid #dc2626',
      borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Connection Error</div>
        <div style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{error}</div>
      </div>
      <button onClick={clearError} aria-label="Dismiss error" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 16, lineHeight: 1, flexShrink: 0, padding: 2 }}>×</button>
    </div>
  );
};

export default ErrorToast;
