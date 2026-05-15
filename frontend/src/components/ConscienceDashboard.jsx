import React, { useState, useEffect, useRef } from 'react';
import { useSimulation } from '../context/SimulationContext';
import ScoreMeter from './ScoreMeter';
import PolicyReport from './PolicyReport';

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
    const msgInterval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);

    const progInterval = setInterval(() => {
      setProgress((p) => Math.min(p + 1.2, 92));
    }, 100);

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, []);

  return (
    <div style={{ padding: '28px 0' }}>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 16,
          height: 16,
          border: '2px solid rgba(245,158,11,0.2)',
          borderTop: '2px solid #f59e0b',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
          flexShrink: 0,
        }} />
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: '#f59e0b',
          letterSpacing: '0.05em',
        }}>
          {LOADING_MESSAGES[msgIdx]}
        </div>
      </div>
      <div className="progress-bar-track" style={{ height: 4 }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #f59e0b80, #f59e0b)',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
      <div style={{
        marginTop: 8,
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 10,
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.08em',
      }}>
        Powered by Gemini · OilNiti AI Engine
      </div>
    </div>
  );
};

const ConscienceDashboard = () => {
  const {
    simulationResult,
    generateReport,
    useMockReport,
    policyReport,
    reportLoading,
    isLoading,
  } = useSimulation();

  const res = simulationResult;

  const farmerScore = res?.farmer_impact?.farmer_protection_score ?? 0;
  const consumerScore = res?.consumer_impact?.consumer_affordability_score ?? 0;
  const atmaNirbhar = res ? ((res.atma_nirbhar_before + res.atma_nirbhar_after) / 2) : 0;

  const canGenerate = !!res && !reportLoading;

  return (
    <section id="conscience" style={{ marginBottom: 40 }}>
      <div className="panel-card" style={{
        background: 'linear-gradient(180deg, #111827 0%, #0d1325 100%)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="section-label">Panel 04 · AI Policy Intelligence</div>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#e8eaf2',
            marginTop: 4,
          }}>
            AI Conscience Dashboard
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 6,
          }}>
            Composite scores &amp; AI-generated policy brief
          </p>
        </div>

        {/* Score Meters */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          flexWrap: 'wrap',
          marginBottom: 48,
          padding: '32px',
          background: 'rgba(255,255,255,0.02)',
          borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.04)',
        }}
          className="score-meters"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <ScoreMeter
              value={farmerScore}
              max={100}
              color="#10b981"
              label="Farmer Protection Score"
              size={160}
              strokeWidth={14}
            />
            {res && (
              <div style={{
                marginTop: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
              }}>
                {farmerScore >= 70 ? '✓ Strong farmer protection' : farmerScore >= 40 ? '⚠ Moderate protection' : '⚠ Low protection'}
              </div>
            )}
          </div>

          {/* Vertical divider */}
          <div style={{ width: 1, background: '#1e2d45', alignSelf: 'stretch', margin: '20px 0' }} className="meter-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <ScoreMeter
              value={consumerScore}
              max={100}
              color="#ef4444"
              label="Consumer Affordability Score"
              size={160}
              strokeWidth={14}
            />
            {res && (
              <div style={{
                marginTop: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
              }}>
                {consumerScore >= 70 ? '✓ Affordable' : consumerScore >= 40 ? '⚠ Moderate burden' : '⚠ High burden'}
              </div>
            )}
          </div>

          <div style={{ width: 1, background: '#1e2d45', alignSelf: 'stretch', margin: '20px 0' }} className="meter-divider" />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
            <ScoreMeter
              value={atmaNirbhar}
              max={100}
              color="#f59e0b"
              label="Ātma Nirbhar Self-Reliance %"
              size={160}
              strokeWidth={14}
            />
            {res && (
              <div style={{
                marginTop: 12,
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                textAlign: 'center',
              }}>
                {res.atma_nirbhar_before}% → {res.atma_nirbhar_after}%
              </div>
            )}
          </div>
        </div>

        {/* No simulation empty state for meters */}
        {!res && (
          <div style={{
            textAlign: 'center',
            padding: '0 0 32px',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            color: 'rgba(255,255,255,0.2)',
          }}>
            Run a simulation to see composite policy scores
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1e2d45 20%, #1e2d45 80%, transparent)', marginBottom: 32 }} />

        {/* Policy Report Generator */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16,
          padding: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 18,
                fontWeight: 700,
                color: '#e8eaf2',
                marginBottom: 8,
              }}>
                ⚡ AI Policy Brief Generator
              </div>
              <p style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                lineHeight: 1.7,
                maxWidth: 500,
              }}>
                Generate a 2-page policy brief using AI — covering farmer welfare, consumer burden, fiscal impact, and a recommended duty sweet spot.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexShrink: 0 }}>
              <div style={{ position: 'relative' }}>
                <button
                  className="btn-primary"
                  onClick={generateReport}
                  disabled={!canGenerate}
                  title={!res ? 'Run a simulation first' : ''}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {reportLoading ? 'Generating...' : '⚡ Generate Policy Report'}
                </button>
                {!res && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 6,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.3)',
                    whiteSpace: 'nowrap',
                    background: '#1a2235',
                    border: '1px solid #1e2d45',
                    borderRadius: 4,
                    padding: '4px 8px',
                    pointerEvents: 'none',
                  }}>
                    Run a simulation first
                  </div>
                )}
              </div>
              {/* Mock report for dev */}
              <button
                className="btn-ghost"
                onClick={useMockReport}
                title="Load mock report for development"
              >
                ⚗ Mock Report
              </button>
            </div>
          </div>

          {/* Loading state */}
          {reportLoading && <ReportLoadingState />}

          {/* Report output */}
          {policyReport && !reportLoading && <PolicyReport report={policyReport} />}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .score-meters {
            flex-direction: column !important;
            align-items: center !important;
          }
          .meter-divider {
            width: 60px !important;
            height: 1px !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};

export default ConscienceDashboard;
