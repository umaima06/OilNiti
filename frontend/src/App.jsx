//App.jsx

import React from 'react';
import { SimulationProvider } from './context/SimulationContext';
import Header from './components/Header';
import TariffControlPanel from './components/TariffControlPanel';
import PriceImpactPanel from './components/PriceImpactPanel';
import HumanFacePanel from './components/HumanFacePanel';
import ConscienceDashboard from './components/ConscienceDashboard';
import DutyHistoryChart from './components/DutyHistoryChart';
import NitiBot from './components/NitiBot';
import ErrorToast from './components/ErrorToast';
import BacktestStrip from './components/BacktestStrip';

const SectionDivider = ({ panelNum, label }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    margin: '0 0 32px',
  }}>
    <div style={{
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: 10,
      color: 'rgba(255,255,255,0.12)',
      letterSpacing: '0.15em',
      flexShrink: 0,
    }}>
      §{panelNum}
    </div>
    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #1e2d45 0%, transparent 100%)' }} />
  </div>
);

function App() {
  return (
    <SimulationProvider>
      {/* SEO meta is in index.html */}
      <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
        <Header />

        {/* Hero banner */}
        <div style={{
          background: 'linear-gradient(180deg, #080c18 0%, #0a0e1a 100%)',
          borderBottom: '1px solid #1e2d45',
          padding: '28px 32px 24px',
        }}>
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}>
              <div>
                <div style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.25)',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>
                  India's First Policy Conscience Machine
                </div>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 'clamp(24px, 4vw, 42px)',
                  fontWeight: 800,
                  color: '#e8eaf2',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                }}>
                  Edible Oil Tariff{' '}
                  <span style={{ color: '#f59e0b' }}>Simulation Engine</span>
                </h1>
                <p style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: 12,
                  color: 'rgba(255,255,255,0.3)',
                  marginTop: 10,
                  letterSpacing: '0.04em',
                  maxWidth: 600,
                }}>
                  Adjust CPO &amp; RPO import duties → model price impacts → quantify farmer welfare &amp; consumer burden across India's 36 states &amp; UTs.
                </p>
              </div>

              {/* Stats strip */}
              <div style={{
                display: 'flex',
                gap: 1,
                background: '#1e2d45',
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid #1e2d45',
              }}>
                {[
                  { value: '₹1.5L Cr', label: 'Palm oil market' },
                  { value: '8 Crore', label: 'Farm families' },
                  { value: '140 Cr', label: 'Consumers' },
                  { value: '36', label: 'States & UTs' },
                ].map((stat) => (
                  <div key={stat.label} style={{
                    padding: '14px 20px',
                    background: '#0d1325',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 17,
                      fontWeight: 600,
                      color: '#f59e0b',
                      lineHeight: 1,
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: 9,
                      color: 'rgba(255,255,255,0.2)',
                      letterSpacing: '0.08em',
                      marginTop: 5,
                    }}>
                      {stat.label.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '40px 32px',
        }}>
          <TariffControlPanel />

          <SectionDivider panelNum="02" label="Market Signals" />
          <PriceImpactPanel />

          <SectionDivider panelNum="03" label="Human Face" />
          <HumanFacePanel />

          <SectionDivider panelNum="04" label="AI Conscience" />
          <ConscienceDashboard />

          <SectionDivider panelNum="05" label="Historical Context" />
          <DutyHistoryChart />

          {/* Footer */}
          <footer style={{
            marginTop: 60,
            paddingTop: 32,
            borderTop: '1px solid #1e2d45',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <BacktestStrip />
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.1)',
            }}>
              Built with ♥ for Indian Kisans &amp; Ghars · SummerSaaS 2026
            </div>
          </footer>
        </main>

        <NitiBot />
        <ErrorToast />
      </div>
    </SimulationProvider>
  );
}

export default App;
