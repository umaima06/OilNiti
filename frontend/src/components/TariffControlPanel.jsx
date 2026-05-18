//TariffControlPanel.jsx

import React, { useState, useCallback } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { ProGate, ProBadge } from './ProGate';
import { DEMO_MODE, IS_PRO } from '../config';

const PRESETS = [
  { id: 'ukraine', label: 'Ukraine War 2022', desc: 'Global CPO spike +40%', emoji: '🔴', cpo: 5.0, rpo: 12.5, shock: 40.0 },
  { id: 'indonesia', label: 'Indonesia Export Ban', desc: 'Supply disruption +28%', emoji: '🟡', cpo: 5.0, rpo: 12.5, shock: 28.0 },
  { id: 'budget2024', label: 'Sept 2024 Duty Hike', desc: 'Farmer protection focus', emoji: '🟢', cpo: 27.5, rpo: 37.5, shock: 0.0 },
  { id: 'zero_duty', label: 'Zero Duty Scenario', desc: 'Full import liberalization', emoji: '⚪', cpo: 0.0, rpo: 0.0, shock: 0.0 },
  { id: 'default', label: 'Reset to Current', desc: 'FY25 baseline rates', emoji: '🔵', cpo: 20.0, rpo: 32.5, shock: 0.0 },
];

const SliderControl = ({ label, subLabel, value, min, max, step = 0.25, onChange, color = '#16a34a' }) => {
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <div style={{ flex: 1 }}>
      {/* Label row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
        <div>
          <div className="section-label">{subLabel}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111', marginTop: 2 }}>
            {label}
          </div>
        </div>
        <div style={{
          fontSize: 36,
          fontWeight: 800,
          color: color,
          lineHeight: 1,
          letterSpacing: '-1px',
        }}>
          {Number(value).toFixed(value % 1 ? 2 : 0)}%
        </div>
      </div>

      {/* Slider */}
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
          background: `linear-gradient(to right, ${color} ${pct}%, #e5e7eb ${pct}%)`,
        }}
      />
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: 6,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: '#9ca3af',
      }}>
        <span>{min}%</span>
        <span>{max}%</span>
      </div>
    </div>
  );
};

const TariffControlPanel = () => {
  const {
    cpoDuty, setCpoDuty,
    rpoDuty, setRpoDuty,
    globalShock, setGlobalShock,
    runSimulation,
    isLoading,
    activePreset,
    applyPreset,
    useMockData,
    error,
  } = useSimulation();

  const [localPreset, setLocalPreset] = useState(null);
  const [customScenarios, setCustomScenarios] = useState([]);
  const [newScenarioName, setNewScenarioName] = useState('');
  const isProUnlocked = DEMO_MODE || IS_PRO;

  const handlePreset = useCallback((preset) => {
    const { cpo, rpo, shock } = applyPreset(preset.id);
    setLocalPreset(preset.id);
    setTimeout(() => runSimulation(cpo, rpo, shock), 50);
  }, [applyPreset, runSimulation]);

  const handleSimulate = () => {
    setLocalPreset(null);
    runSimulation(cpoDuty, rpoDuty, globalShock);
  };

  const handleSaveScenario = () => {
    if (!newScenarioName.trim()) return;
    const newScenario = {
      id: `custom_${Date.now()}`,
      label: newScenarioName,
      desc: `CPO: ${cpoDuty}%, RPO: ${rpoDuty}%`,
      emoji: '⭐',
      cpo: cpoDuty,
      rpo: rpoDuty,
      shock: globalShock,
    };
    setCustomScenarios([...customScenarios, newScenario]);
    setNewScenarioName('');
  };

  return (
    <section id="control" style={{ marginBottom: 0 }}>
      {/* Section heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
          Tariff Control Room
        </h2>
        <p style={{ fontSize: 15, color: '#555', marginTop: 6 }}>
          Adjust import duties and simulate policy outcomes in real time.
        </p>
      </div>

      <div className="panel-card">
        {/* Sliders in 2-col */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 48,
          marginBottom: 32,
        }}
          className="slider-grid"
        >
          <SliderControl
            label={<>Crude Palm Oil (CPO) <ProBadge /></>}
            subLabel="HS Code 1511.10"
            value={cpoDuty}
            min={0}
            max={isProUnlocked ? 150 : 30}
            step={0.5}
            onChange={setCpoDuty}
            color="#16a34a"
          />
          <SliderControl
            label={<>Refined Palm Oil (RPO) <ProBadge /></>}
            subLabel="HS Code 1511.90"
            value={rpoDuty}
            min={0}
            max={isProUnlocked ? 100 : 30}
            step={0.25}
            onChange={setRpoDuty}
            color="#16a34a"
          />
        </div>

        {/* Global Shock */}
        <ProGate featureName="Custom Global Price Shock">
          <div style={{
            marginBottom: 32,
            padding: '24px',
            borderRadius: 12,
            background: '#fef2f2',
            border: '1px solid #fecaca',
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#991b1b', marginBottom: 16 }}>
              [PRO] Custom shock
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Type</label>
                <select style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', fontSize: 14 }}>
                  <option>Rupee depreciation</option>
                  <option>Domestic Production Drop</option>
                  <option>Global CPO Price Spike</option>
                  <option>FTA Duty Elimination</option>
                  <option>Custom Combination</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#7f1d1d', marginBottom: 8 }}>Intensity (%)</label>
                <input 
                  type="number" 
                  value={globalShock} 
                  onChange={(e) => setGlobalShock(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '10px 0' }}>
                  <input type="checkbox" checked readOnly style={{ width: 16, height: 16, accentColor: '#dc2626' }} />
                  <span style={{ fontSize: 14, fontWeight: 500, color: '#7f1d1d' }}>Apply to simulation</span>
                </label>
              </div>
            </div>
          </div>
        </ProGate>

        {/* Tariff gap */}
        <div style={{
          marginBottom: 28,
          padding: '14px 20px',
          borderRadius: 8,
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>Tariff Gap</div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              color: cpoDuty - rpoDuty > 0 ? '#16a34a' : '#dc2626',
              marginTop: 2,
            }}>
              {(cpoDuty - rpoDuty).toFixed(2)}pp
            </div>
          </div>
          <div style={{ flex: 1, fontSize: 13, color: '#9ca3af' }}>
            {cpoDuty - rpoDuty > 20
              ? '⚠ High gap incentivises import of refined oil, hurting domestic refiners'
              : cpoDuty - rpoDuty < 0
              ? '⚠ Negative gap: RPO cheaper than CPO — refining arbitrage risk'
              : '✓ Gap within acceptable range for domestic refining viability'}
          </div>
        </div>

        {/* Scenario Cards — 5 cards grid */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12 }}>Shock Scenario Presets</div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
          }}>
            {[...PRESETS, ...customScenarios].map((preset) => (
              <button
                key={preset.id}
                className={`preset-pill ${localPreset === preset.id ? 'active' : ''}`}
                onClick={() => handlePreset(preset)}
                title={`CPO: ${preset.cpo}% | RPO: ${preset.rpo}%`}
              >
                <span style={{ fontSize: 20 }}>{preset.emoji}</span>
                <span style={{ fontWeight: 600, color: '#111' }}>{preset.label}</span>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>{preset.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Custom Scenario Builder */}
        <ProGate featureName="Custom Scenario Builder">
          <div style={{
            marginBottom: 32,
            padding: '20px 24px',
            borderRadius: 12,
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
            flexWrap: 'wrap'
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 6 }}>Save Current Configuration as Scenario</label>
              <input 
                type="text" 
                placeholder="e.g. Worst Case Monsoon"
                value={newScenarioName}
                onChange={e => setNewScenarioName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 14
                }}
              />
            </div>
            <button 
              className="btn-primary"
              onClick={handleSaveScenario}
              disabled={!newScenarioName.trim()}
              style={{ padding: '10px 20px', whiteSpace: 'nowrap' }}
            >
              ⭐ Save Scenario
            </button>
          </div>
        </ProGate>

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
                  width: 16, height: 16,
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid #fff',
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

          <button className="btn-ghost" onClick={useMockData} style={{ whiteSpace: 'nowrap' }}>
            ⚗ Use Mock Data
          </button>
        </div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .slider-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
};

export default TariffControlPanel;
