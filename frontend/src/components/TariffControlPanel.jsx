import React, { useState, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';

const PRESETS = [
  { id: 'ukraine', label: 'Ukraine War 2022', emoji: '🔴', cpo: 5.5, rpo: 5.5 },
  { id: 'indonesia', label: 'Indonesia Export Ban', emoji: '🟡', cpo: 100, rpo: 13.75 },
  { id: 'budget2025', label: 'Budget 2025 Actual', emoji: '🟢', cpo: 20, rpo: 32.5 },
  { id: 'default', label: 'Reset to Default', emoji: '⚪', cpo: 100, rpo: 13.75 },
];

const SliderControl = ({ label, subLabel, value, min, max, step = 0.25, onChange, color = '#f59e0b' }) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ flex: 1 }}>
      {/* Label */}
      <div style={{ marginBottom: 16 }}>
        <div className="section-label">{subLabel}</div>
        <div style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.85)',
          marginTop: 4,
          lineHeight: 1.3,
        }}>
          {label}
        </div>
      </div>

      {/* Big value display */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 64,
        fontWeight: 600,
        color: color,
        lineHeight: 1,
        marginBottom: 20,
        textShadow: `0 0 30px ${color}40`,
        letterSpacing: '-0.02em',
      }}>
        {Number(value).toFixed(2).replace(/\.00$/, '')}
        <span style={{ fontSize: 28, color: `${color}80`, marginLeft: 4 }}>%</span>
      </div>

      {/* Slider */}
      <div style={{ position: 'relative' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          aria-label={label}
          style={{
            width: '100%',
            background: `linear-gradient(to right, ${color} ${pct}%, #1e2d45 ${pct}%)`,
          }}
        />
        {/* Min/max labels */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 8,
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: 'rgba(255,255,255,0.25)',
          letterSpacing: '0.05em',
        }}>
          <span>{min}%</span>
          <span>{max}%</span>
        </div>
      </div>

      {/* Quick tick marks */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginTop: 12,
        flexWrap: 'wrap',
      }}>
        {[0, 25, 50, 75, 100].filter(v => v <= max).map(v => (
          <button
            key={v}
            onClick={() => onChange(v)}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              padding: '3px 8px',
              borderRadius: 4,
              border: `1px solid ${Math.abs(value - v) < 0.1 ? color : '#1e2d45'}`,
              background: Math.abs(value - v) < 0.1 ? `${color}15` : 'transparent',
              color: Math.abs(value - v) < 0.1 ? color : 'rgba(255,255,255,0.25)',
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {v}%
          </button>
        ))}
      </div>
    </div>
  );
};

const TariffControlPanel = () => {
  const {
    cpoDuty, setCpoDuty,
    rpoDuty, setRpoDuty,
    runSimulation,
    isLoading,
    activePreset,
    applyPreset,
    useMockData,
    error,
  } = useSimulation();

  const [localPreset, setLocalPreset] = useState(null);

  const handlePreset = useCallback((preset) => {
    const { cpo, rpo } = applyPreset(preset.id);
    setLocalPreset(preset.id);
    // Auto-trigger simulation after a tick
    setTimeout(() => runSimulation(cpo, rpo), 50);
  }, [applyPreset, runSimulation]);

  const handleSimulate = () => {
    setLocalPreset(null);
    runSimulation();
  };

  return (
    <section id="control" style={{ marginBottom: 40 }}>
      <div className="panel-card" style={{
        background: 'linear-gradient(135deg, #0d1325 0%, #111827 100%)',
        borderColor: '#1e2d45',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: 400,
          background: 'radial-gradient(circle at center, rgba(245,158,11,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div className="section-label">Panel 01 · Fiscal Instrument Controls</div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#e8eaf2',
              marginTop: 4,
            }}>
              Tariff Control Room
            </h2>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 6,
              letterSpacing: '0.05em',
            }}>
              Adjust import duties and simulate policy outcomes in real time
            </p>
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9,
            color: 'rgba(255,255,255,0.15)',
            textAlign: 'right',
            letterSpacing: '0.1em',
          }}>
            CUSTOMS TARIFF ACT<br />SCHEDULE I · CHAPTER 15
          </div>
        </div>

        {/* Sliders */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1px 1fr',
          gap: 0,
          marginBottom: 32,
        }}
          className="slider-grid"
        >
          <div style={{ paddingRight: 40 }}>
            <SliderControl
              label="Crude Palm Oil (CPO) Import Duty"
              subLabel="CPO · HS Code 1511.10"
              value={cpoDuty}
              min={0}
              max={150}
              step={0.5}
              onChange={setCpoDuty}
              color="#f59e0b"
            />
          </div>

          {/* Divider */}
          <div style={{ background: '#1e2d45', margin: '0 0' }} />

          <div style={{ paddingLeft: 40 }}>
            <SliderControl
              label="Refined, Bleached & Deodorised (RPO) Import Duty"
              subLabel="RPO · HS Code 1511.90"
              value={rpoDuty}
              min={0}
              max={100}
              step={0.25}
              onChange={setRpoDuty}
              color="#3b82f6"
            />
          </div>
        </div>

        {/* Tariff gap indicator */}
        <div style={{
          marginBottom: 28,
          padding: '12px 16px',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <div className="section-label">Tariff Gap (CPO − RPO)</div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 20,
              fontWeight: 600,
              color: cpoDuty - rpoDuty > 0 ? '#10b981' : '#ef4444',
              marginTop: 2,
            }}>
              {(cpoDuty - rpoDuty).toFixed(2)}pp
            </div>
          </div>
          <div style={{ flex: 1, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
            {cpoDuty - rpoDuty > 20
              ? '⚠ High gap incentivises import of refined oil, hurting domestic refiners'
              : cpoDuty - rpoDuty < 0
              ? '⚠ Negative gap: RPO cheaper than CPO — refining arbitrage risk'
              : '✓ Gap within acceptable range for domestic refining viability'}
          </div>
        </div>

        {/* Shock Scenario Presets */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label" style={{ marginBottom: 12 }}>Shock Scenario Presets</div>
          <div style={{
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                className={`preset-pill ${localPreset === preset.id ? 'active' : ''}`}
                onClick={() => handlePreset(preset)}
                title={`CPO: ${preset.cpo}% | RPO: ${preset.rpo}%`}
              >
                <span style={{ fontSize: 14 }}>{preset.emoji}</span>
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            className="btn-primary"
            onClick={handleSimulate}
            disabled={isLoading}
            style={{ flex: '1 1 200px', minWidth: 200 }}
          >
            {isLoading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{
                  width: 16,
                  height: 16,
                  border: '2px solid rgba(10,14,26,0.3)',
                  borderTop: '2px solid #0a0e1a',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Running Simulation...
              </span>
            ) : (
              'Run Simulation →'
            )}
          </button>

          <button
            className="btn-ghost"
            onClick={useMockData}
            title="Load mock data for UI development"
            style={{ whiteSpace: 'nowrap' }}
          >
            ⚗ Use Mock Data
          </button>
        </div>

        {/* Inline style for spin */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Responsive slider grid styles */}
      <style>{`
        @media (max-width: 768px) {
          .slider-grid {
            grid-template-columns: 1fr !important;
          }
          .slider-grid > div:nth-child(2) {
            display: none;
          }
          .slider-grid > div:last-child {
            padding-left: 0 !important;
            padding-top: 32px;
          }
          .slider-grid > div:first-child {
            padding-right: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default TariffControlPanel;
