//ErrorToast.jsx
import React, { useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';

const ErrorToast = () => {
  const { error, clearError } = useSimulation();

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(clearError, 6000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  if (!error) return null;

  return (
    <div
      className="toast"
      role="alert"
      aria-live="assertive"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        maxWidth: 420,
        background: '#1a1a2e',
        border: '1px solid rgba(239,68,68,0.4)',
        borderLeft: '4px solid #ef4444',
        borderRadius: 10,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 13,
          fontWeight: 600,
          color: '#f87171',
          marginBottom: 4,
        }}>
          Connection Error
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 11,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.5,
        }}>
          {error}
        </div>
      </div>
      <button
        onClick={clearError}
        aria-label="Dismiss error"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer',
          fontSize: 16,
          lineHeight: 1,
          flexShrink: 0,
          padding: 2,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default ErrorToast;
