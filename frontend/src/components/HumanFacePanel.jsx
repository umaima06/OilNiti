//HumanFacePanel.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import IndiaMap from './IndiaMap';
import StateDeepDiveModal from './StateDeepDiveModal';

const ProgressBar = ({ value, max = 100, color }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-bar-track">
      <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
};

const ImpactCard = ({ icon, headline, bigNumber, bigNumberSub, supportingStat, scoreLabel, score, scoreMax = 100, accentColor, borderColor, animDelay = 0, visible }) => {
  const cardRef = useRef(null);
  useEffect(() => {
    if (!cardRef.current) return;
    if (visible) {
      cardRef.current.style.opacity = '0';
      cardRef.current.style.transform = 'translateY(24px)';
      setTimeout(() => {
        if (!cardRef.current) return;
        cardRef.current.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        cardRef.current.style.opacity = '1';
        cardRef.current.style.transform = 'translateY(0)';
      }, animDelay);
    }
  }, [visible, animDelay]);

  return (
    <div ref={cardRef} style={{
      flex: 1, minWidth: 280, background: '#fff',
      border: '1px solid #e5e7eb', borderLeft: `3px solid ${borderColor}`,
      borderRadius: 12, padding: 28,
    }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: accentColor, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>{headline}</div>
      <div style={{ fontSize: 44, fontWeight: 900, color: '#111', lineHeight: 1, letterSpacing: '-1px', marginBottom: 4 }}>{bigNumber}</div>
      <div style={{ fontSize: 14, color: '#9ca3af', marginBottom: 20 }}>{bigNumberSub}</div>
      <div style={{ padding: '10px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb', marginBottom: 20, fontSize: 14, fontWeight: 600, color: '#111' }}>{supportingStat}</div>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{scoreLabel}</span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 14, fontWeight: 700, color: accentColor }}>{score}/{scoreMax}</span>
        </div>
        <ProgressBar value={score} max={scoreMax} color={accentColor} />
      </div>
      <div style={{ marginTop: 16, fontSize: 13, fontWeight: 600, color: accentColor }}>View details →</div>
    </div>
  );
};

const HumanFacePanel = () => {
  const { simulationResult } = useSimulation();
  const [prevResult, setPrevResult] = useState(null);
  const [visible, setVisible] = useState(false);
  const [stateSearch, setStateSearch] = useState('');

  const [selectedStateData, setSelectedStateData] = useState(null);

  useEffect(() => {
    if (simulationResult && simulationResult !== prevResult) {
      setVisible(false);
      setTimeout(() => { setPrevResult(simulationResult); setVisible(true); }, 50);
    } else if (!simulationResult) { setVisible(false); setPrevResult(null); }
  }, [simulationResult]);

  const res = simulationResult;

  return (
    <section id="human" style={{ marginBottom: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>The Human Face of Tariff Policy</h2>
        <p style={{ fontSize: 15, color: '#555', marginTop: 6 }}>Every duty decision has a face — a farmer in Rajasthan, a family in Chennai.</p>
      </div>

      {!res ? (
        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }} className="human-cards">
          <div style={{ flex: 1, minWidth: 280, background: '#f9fafb', border: '1px solid #e5e7eb', borderLeft: '3px solid #16a34a', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240 }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>🌾</div>
            <div style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>Farmer impact will appear<br />after simulation</div>
          </div>
          <div style={{ flex: 1, minWidth: 280, background: '#f9fafb', border: '1px solid #e5e7eb', borderLeft: '3px solid #ea580c', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 240 }}>
            <div style={{ fontSize: 48, opacity: 0.15 }}>🏠</div>
            <div style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center' }}>Consumer burden will appear<br />after simulation</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 20, marginBottom: 40 }} className="human-cards">
          <ImpactCard icon="🌾" headline={`${res.farmer_impact.top_state} Mustard Farmers`} bigNumber={`+₹${res.farmer_impact.income_delta_per_farmer.toLocaleString('en-IN')}`} bigNumberSub="per farmer, per year" supportingStat={`${res.farmer_impact.farmers_benefited_lakhs} lakh farmers directly benefited`} scoreLabel="Farmer Protection" score={res.farmer_impact.farmer_protection_score} accentColor="#16a34a" borderColor="#16a34a" animDelay={0} visible={visible} />
          <ImpactCard icon="🏠" headline={res.consumer_impact.example_household} bigNumber={`+₹${res.consumer_impact.monthly_extra_cost}`} bigNumberSub="extra spent on cooking oil / month" supportingStat={`${res.consumer_impact.pct_of_income}% of monthly household income`} scoreLabel="Consumer Affordability" score={res.consumer_impact.consumer_affordability_score} accentColor="#ea580c" borderColor="#ea580c" animDelay={150} visible={visible} />
        </div>
      )}

      <div style={{ background: '#f9fafb', borderRadius: 12, padding: 32, border: '1px solid #e5e7eb' }}>
        <IndiaMap onStateClick={setSelectedStateData} />
      </div>

      <StateDeepDiveModal 
        stateData={selectedStateData} 
        onClose={() => setSelectedStateData(null)} 
      />

      {res && res.state_impact && res.state_impact.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111' }}>All {res.state_impact.length} States & UTs — Ranked by Net Impact</h3>
            <div style={{ position: 'relative', minWidth: 240 }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14, pointerEvents: 'none' }}>🔍</span>
              <input
                type="text"
                placeholder="Search states..."
                value={stateSearch}
                onChange={e => setStateSearch(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1px solid #e5e7eb', borderRadius: 8,
                  fontSize: 13, color: '#111', background: '#fff',
                  outline: 'none', transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = '#16a34a'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f9fafb' }}>
                  {['#','STATE','NET IMPACT','FARMER Δ/YR','CONSUMER Δ/MO','FARMERS (L)'].map((h,i) => (
                    <th key={h} style={{ textAlign: i<2?'left':i===2?'center':'right', padding: '12px 16px', color: '#9ca3af', fontWeight: 600, fontSize: 11, letterSpacing: '1px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...res.state_impact].filter(s => s.state.toLowerCase().includes(stateSearch.toLowerCase())).sort((a, b) => b.magnitude - a.magnitude).map((s, i) => {
                  const netColor = s.net === 'farmer' ? '#16a34a' : s.net === 'consumer' ? '#ea580c' : '#111';
                  const netLabel = s.net === 'farmer' ? '🌾 Farmer' : s.net === 'consumer' ? '🏠 Consumer' : '⚖ Mixed';
                  return (
                    <tr key={s.state} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{i + 1}</td>
                      <td style={{ padding: '12px 16px', color: '#111', fontWeight: 600 }}>{s.state}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}><span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: `${netColor}12`, color: netColor, border: `1px solid ${netColor}25` }}>{netLabel}</span></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#16a34a', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>+₹{(s.farmer_annual_delta ?? Math.round(s.magnitude * 3200)).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#ea580c', fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace" }}>+₹{Math.round(s.consumer_monthly_delta ?? s.magnitude * 287)}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', color: '#9ca3af', fontFamily: "'IBM Plex Mono', monospace" }}>{s.oilseed_farmers_lakh ?? '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`@media (max-width: 768px) { .human-cards { flex-direction: column !important; } }`}</style>
    </section>
  );
};

export default HumanFacePanel;
