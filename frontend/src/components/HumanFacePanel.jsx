//HumanFacePanel.jsx

import React, { useEffect, useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import IndiaMap from './IndiaMap';

const ProgressBar = ({ value, max = 100, color }) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}80, ${color})`,
          boxShadow: `0 0 8px ${color}60`,
        }}
      />
    </div>
  );
};

const ImpactCard = ({
  icon, headline, bigNumber, bigNumberSub,
  supportingStat, scoreLabel, score, scoreMax = 100, scoreColor,
  accentColor, dimColor, borderColor, animDelay = 0, visible
}) => {
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
    <div
      ref={cardRef}
      style={{
        flex: 1,
        minWidth: 280,
        background: `linear-gradient(145deg, ${dimColor} 0%, rgba(13,19,37,0.95) 100%)`,
        border: `1px solid ${borderColor}`,
        borderRadius: 16,
        padding: 32,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow blob */}
      <div style={{
        position: 'absolute',
        top: -60,
        right: -60,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}15 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{
        fontSize: 40,
        marginBottom: 16,
        filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
      }}>
        {icon}
      </div>

      {/* Headline */}
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: accentColor,
        marginBottom: 8,
        opacity: 0.8,
      }}>
        {headline}
      </div>

      {/* Big number */}
      <div style={{
        fontFamily: "'Sora', sans-serif",
        fontSize: 56,
        fontWeight: 800,
        color: accentColor,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        marginBottom: 8,
        textShadow: `0 0 40px ${accentColor}40`,
      }}>
        {bigNumber}
      </div>

      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 12,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 20,
        letterSpacing: '0.05em',
      }}>
        {bigNumberSub}
      </div>

      {/* Supporting stat */}
      <div style={{
        padding: '10px 14px',
        borderRadius: 8,
        background: `${accentColor}10`,
        border: `1px solid ${accentColor}20`,
        marginBottom: 24,
        fontFamily: "'Sora', sans-serif",
        fontSize: 14,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.75)',
      }}>
        {supportingStat}
      </div>

      {/* Score bar */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 10,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.1em',
          }}>
            {scoreLabel}
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 13,
            fontWeight: 600,
            color: accentColor,
          }}>
            {score}/{scoreMax}
          </div>
        </div>
        <ProgressBar value={score} max={scoreMax} color={accentColor} />
      </div>
    </div>
  );
};

const HumanFacePanel = () => {
  const { simulationResult } = useSimulation();
  const [prevResult, setPrevResult] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (simulationResult && simulationResult !== prevResult) {
      setVisible(false);
      setTimeout(() => {
        setPrevResult(simulationResult);
        setVisible(true);
      }, 50);
    } else if (!simulationResult) {
      setVisible(false);
      setPrevResult(null);
    }
  }, [simulationResult]);

  const res = simulationResult;

  return (
    <section id="human" style={{ marginBottom: 40 }}>
      <div className="panel-card" style={{
        background: 'linear-gradient(180deg, #0d1325 0%, #0a0e1a 100%)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div className="section-label">Panel 03 · Welfare Impact Analysis</div>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#e8eaf2',
            marginTop: 4,
          }}>
            The Human Face of Tariff Policy
          </h2>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: 'rgba(255,255,255,0.3)',
            marginTop: 6,
          }}>
            Every duty decision has a face — a farmer in Rajasthan, a family in Chennai.
          </p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #1e2d45 20%, #1e2d45 80%, transparent)', margin: '24px 0' }} />

        {/* Two cards */}
        {!res ? (
          <div style={{
            display: 'flex',
            gap: 20,
            marginBottom: 40,
          }}
            className="human-cards"
          >
            {/* Farmer placeholder */}
            <div style={{
              flex: 1,
              minWidth: 280,
              background: 'rgba(6,78,59,0.08)',
              border: '1px solid rgba(16,185,129,0.12)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              minHeight: 280,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🌾</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                Farmer impact will appear<br />after simulation
              </div>
            </div>
            {/* Consumer placeholder */}
            <div style={{
              flex: 1,
              minWidth: 280,
              background: 'rgba(127,29,29,0.08)',
              border: '1px solid rgba(239,68,68,0.12)',
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              minHeight: 280,
            }}>
              <div style={{ fontSize: 48, opacity: 0.2 }}>🏠</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                Consumer burden will appear<br />after simulation
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: 20,
            marginBottom: 40,
          }}
            className="human-cards"
          >
            <ImpactCard
              icon="🌾"
              headline={`${res.farmer_impact.top_state} Mustard Farmers`}
              bigNumber={`+₹${res.farmer_impact.income_delta_per_farmer.toLocaleString('en-IN')}`}
              bigNumberSub="per farmer, per year"
              supportingStat={`${res.farmer_impact.farmers_benefited_lakhs} lakh farmers directly benefited`}
              scoreLabel="Farmer Protection Score"
              score={res.farmer_impact.farmer_protection_score}
              accentColor="#10b981"
              dimColor="rgba(6,78,59,0.25)"
              borderColor="rgba(16,185,129,0.3)"
              animDelay={0}
              visible={visible}
            />
            <ImpactCard
              icon="🏠"
              headline={res.consumer_impact.example_household}
              bigNumber={`+₹${res.consumer_impact.monthly_extra_cost}`}
              bigNumberSub="extra spent on cooking oil / month"
              supportingStat={`${res.consumer_impact.pct_of_income}% of monthly household income`}
              scoreLabel="Consumer Affordability Score"
              score={res.consumer_impact.consumer_affordability_score}
              accentColor="#ef4444"
              dimColor="rgba(127,29,29,0.25)"
              borderColor="rgba(239,68,68,0.3)"
              animDelay={150}
              visible={visible}
            />
          </div>
        )}

        {/* India Map */}
        <IndiaMap />

        {/* State Leaderboard Table */}
        {res && res.state_impact && res.state_impact.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div style={{ marginBottom: 16 }}>
              <div className="section-label">State-Level Impact Leaderboard</div>
              <h3 style={{
                fontFamily: "'Sora', sans-serif",
                fontSize: 16,
                fontWeight: 600,
                color: '#e8eaf2',
                marginTop: 4,
              }}>
                All {res.state_impact.length} States & UTs — Ranked by Net Impact
              </h3>
            </div>
            <div style={{
              overflowX: 'auto',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11,
              }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>#</th>
                    <th style={{ textAlign: 'left', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>STATE</th>
                    <th style={{ textAlign: 'center', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>NET IMPACT</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>FARMER Δ/YR</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>CONSUMER Δ/MO</th>
                    <th style={{ textAlign: 'right', padding: '10px 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.08em', fontSize: 10 }}>FARMERS (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {[...res.state_impact]
                    .sort((a, b) => b.magnitude - a.magnitude)
                    .map((s, i) => {
                      const netColor = s.net === 'farmer' ? '#10b981' : s.net === 'consumer' ? '#ef4444' : '#f59e0b';
                      const netLabel = s.net === 'farmer' ? '🌾 Farmer' : s.net === 'consumer' ? '🏠 Consumer' : '⚖ Mixed';
                      return (
                        <tr key={s.state} style={{
                          background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          transition: 'background 0.15s',
                        }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)'}
                        >
                          <td style={{ padding: '10px 14px', color: 'rgba(255,255,255,0.25)' }}>{i + 1}</td>
                          <td style={{ padding: '10px 14px', color: '#e8eaf2', fontWeight: 500 }}>{s.state}</td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '3px 10px',
                              borderRadius: 999,
                              fontSize: 10,
                              fontWeight: 600,
                              background: `${netColor}15`,
                              color: netColor,
                              border: `1px solid ${netColor}30`,
                            }}>
                              {netLabel}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>
                            +₹{(s.farmer_annual_delta ?? Math.round(s.magnitude * 3200)).toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
                            +₹{Math.round(s.consumer_monthly_delta ?? s.magnitude * 287)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', color: 'rgba(255,255,255,0.5)' }}>
                            {s.oilseed_farmers_lakh ?? '—'}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .human-cards {
            flex-direction: column !important;
          }
        }
      `}</style>
    </section>
  );
};

export default HumanFacePanel;
