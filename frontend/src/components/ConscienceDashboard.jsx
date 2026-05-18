import React, { useState, useEffect } from 'react';
import { useSimulation } from '../context/SimulationContext';
import ScoreMeter from './ScoreMeter';
import PolicyReport from './PolicyReport';
import { ProGate, openUpgradeModal, ProBadge } from './ProGate';
import { DEMO_MODE, IS_PRO } from '../config';

const LOADING_MESSAGES = [
  'Analyzing farmer impact data...',
  'Computing consumer burden index...',
  'Calculating fiscal implications...',
  'Drafting policy recommendations...',
  'Synthesizing welfare trade-offs...',
  'Finalizing OilNiti brief...',
];

const ReportLoadingState = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const m = setInterval(() => setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length), 1800);
    const p = setInterval(() => setProgress(v => Math.min(v + 1.2, 92)), 100);
    return () => { clearInterval(m); clearInterval(p); };
  }, []);

  return (
    <div style={{ padding: '28px 0' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTop: '2px solid #16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 500, color: '#16a34a' }}>{LOADING_MESSAGES[msgIdx]}</div>
      </div>
      <div className="progress-bar-track" style={{ height: 4 }}>
        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: '#16a34a', transition: 'width 0.1s linear' }} />
      </div>
      <div style={{ marginTop: 8, fontSize: 11, color: '#9ca3af' }}>Powered by LLaMA 3.1 · OilNiti AI Engine</div>
    </div>
  );
};

const ConscienceDashboard = () => {
  const { simulationResult, generateReport, useMockReport, policyReport, reportLoading } = useSimulation();
  const [reportsUsed, setReportsUsed] = useState(0);
  const [reportType, setReportType] = useState('think_tank');
  const FREE_TIER_LIMIT = 1;
  
  const res = simulationResult;
  const farmerScore = res?.farmer_impact?.farmer_protection_score ?? 0;
  const consumerScore = res?.consumer_impact?.consumer_affordability_score ?? 0;
  const atmaNirbhar = res ? ((res.atma_nirbhar_before + res.atma_nirbhar_after) / 2) : 0;
  const canGenerate = !!res && !reportLoading;

  const isProUnlocked = DEMO_MODE || IS_PRO;
  const limitReached = !isProUnlocked && reportsUsed >= FREE_TIER_LIMIT;

  const handleGenerateReport = async () => {
    if (limitReached) {
      openUpgradeModal();
      return;
    }
    await generateReport(reportType);
    if (!isProUnlocked) {
      setReportsUsed(prev => prev + 1);
    }
  };

  return (
    <section id="conscience" style={{ marginBottom: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>AI Conscience Dashboard</h2>
        <p style={{ fontSize: 15, color: '#555', marginTop: 6 }}>Composite scores & AI-generated policy brief</p>
      </div>

      <div className="panel-card">
        {/* Score Meters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap', marginBottom: 40, padding: 32, background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb' }} className="score-meters">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ScoreMeter value={farmerScore} max={100} color="#16a34a" label="Farmer Protection" size={160} strokeWidth={14} />
            {res && <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{farmerScore >= 70 ? '✓ Strong protection' : farmerScore >= 40 ? '⚠ Moderate' : '⚠ Low protection'}</div>}
          </div>
          <div style={{ width: 1, background: '#e5e7eb', alignSelf: 'stretch', margin: '20px 0' }} className="meter-divider" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ScoreMeter value={consumerScore} max={100} color="#ea580c" label="Consumer Affordability" size={160} strokeWidth={14} />
            {res && <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{consumerScore >= 70 ? '✓ Affordable' : consumerScore >= 40 ? '⚠ Moderate burden' : '⚠ High burden'}</div>}
          </div>
          <div style={{ width: 1, background: '#e5e7eb', alignSelf: 'stretch', margin: '20px 0' }} className="meter-divider" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ScoreMeter value={atmaNirbhar} max={100} color="#2563eb" label="Self-Reliance %" size={160} strokeWidth={14} />
            {res && <div style={{ marginTop: 12, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>{res.atma_nirbhar_before}% → {res.atma_nirbhar_after}%</div>}
          </div>
        </div>

        {!res && <div style={{ textAlign: 'center', padding: '0 0 32px', fontSize: 14, color: '#9ca3af' }}>Run a simulation to see composite policy scores</div>}

        <div style={{ height: 1, background: '#e5e7eb', marginBottom: 32 }} />

        {/* Policy Brief Generator */}
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: 28, position: 'relative' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 8, display: 'flex', alignItems: 'center' }}>⚡ AI Policy Brief Generator <ProBadge /></div>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.7, maxWidth: 500 }}>Generate a 2-page policy brief covering farmer welfare, consumer burden, fiscal impact, and a recommended duty sweet spot.</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
              
              {!isProUnlocked && (
                <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280' }}>
                  Reports used: {reportsUsed}/{FREE_TIER_LIMIT} 
                  <button onClick={openUpgradeModal} style={{ background: 'none', border: 'none', color: '#f59e0b', marginLeft: 4, cursor: 'pointer', fontWeight: 700 }}>
                    🔒 Upgrade for unlimited
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Generate Report For:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {[
                    { id: 'think_tank', icon: '🏛', title: 'Policy Research', audience: 'ORF, ICRIER, NITI Aayog' },
                    { id: 'journalist', icon: '📰', title: 'Press Brief', audience: 'Reuters, Mint, BQ Prime' },
                    { id: 'trader', icon: '📊', title: 'Trade Intelligence', audience: 'SEA India, Importers' },
                  ].map(rt => (
                    <button key={rt.id} onClick={() => setReportType(rt.id)}
                      style={{
                        padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                        border: reportType === rt.id ? '2px solid #16a34a' : '1px solid #e5e7eb',
                        background: reportType === rt.id ? '#f0fdf4' : '#fff',
                        textAlign: 'left', transition: 'all 0.2s',
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 4 }}>{rt.icon}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{rt.title}</div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{rt.audience}</div>
                    </button>
                  ))}
                </div>
                
                <div style={{ display: 'flex', gap: 10 }}>
                  <button 
                  className={`btn-primary ${limitReached ? 'disabled-pro' : ''}`} 
                  onClick={handleGenerateReport} 
                  disabled={!canGenerate}
                  style={limitReached ? { background: '#9ca3af', cursor: 'not-allowed' } : {}}
                >
                  {limitReached ? '🔒 Pro Required' : reportLoading ? 'Generating...' : '⚡ Generate Report'}
                </button>
                <button className="btn-ghost" onClick={() => useMockReport(reportType)}>⚗ Mock Report</button>
              </div>
            </div>
            </div>
          </div>
          {reportLoading && <ReportLoadingState />}
          {policyReport && !reportLoading && <PolicyReport report={policyReport} />}
          
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .score-meters { flex-direction: column !important; align-items: center !important; }
          .meter-divider { width: 60px !important; height: 1px !important; margin: 0 !important; }
        }
      `}</style>
    </section>
  );
};

export default ConscienceDashboard;
