//App.jsx

import React, { useState, useEffect } from 'react';
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
import { UpgradeModal } from './components/UpgradeModal';
import ApiAccess from './components/ApiAccess';
import { DEMO_MODE } from './config';

const SectionDivider = () => (
  <div style={{ height: 1, background: '#e5e7eb', margin: '48px 0' }} />
);

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const onLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onLocationChange);
    return () => window.removeEventListener('popstate', onLocationChange);
  }, []);

  if (currentPath === '/api-access') {
    return (
      <SimulationProvider>
        <div style={{ minHeight: '100vh', background: '#ffffff' }}>
          {DEMO_MODE && (
            <div className="demo-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🔓 Demo Mode Active — All Pro features unlocked for evaluation</span>
              <button 
                onClick={() => {
                  localStorage.removeItem('OILNITI_DEMO');
                  window.location.reload();
                }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                Lock Features
              </button>
            </div>
          )}
          <Header />
          <ApiAccess />
          <UpgradeModal />
        </div>
      </SimulationProvider>
    );
  }

  return (
    <SimulationProvider>
      <div style={{ minHeight: '100vh', background: '#ffffff' }}>
        {DEMO_MODE && (
          <div className="demo-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🔓 Demo Mode Active — All Pro features unlocked for evaluation</span>
            <button 
              onClick={() => {
                localStorage.removeItem('OILNITI_DEMO');
                window.location.reload();
              }}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
            >
              Lock Features
            </button>
          </div>
        )}
        <Header />

        {/* HERO — ONE dark section (deep forest green) */}
        <div style={{
          background: '#0d2818',
          padding: '64px 32px 56px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              India's First Policy Conscience Machine
            </div>
            <h1 style={{
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-1.5px',
              maxWidth: 700,
            }}>
              Edible Oil Tariff{' '}
              <span style={{ color: '#4ade80' }}>Simulation Engine</span>
            </h1>
            <p style={{
              fontSize: 16,
              color: 'rgba(255,255,255,0.5)',
              marginTop: 20,
              lineHeight: 1.7,
              maxWidth: 560,
            }}>
              Adjust CPO &amp; RPO import duties → model price impacts → quantify farmer welfare &amp; consumer burden across India's 36 states &amp; UTs.
            </p>
          </div>
        </div>

        {/* STATS STRIP — full-width white row */}
        <div style={{
          borderBottom: '1px solid #e5e7eb',
          background: '#ffffff',
        }}>
          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            textAlign: 'center',
          }}>
            {[
              { value: '₹1.5L Cr', label: 'Palm Oil Market' },
              { value: '8 Crore', label: 'Farm Families' },
              { value: '140 Cr', label: 'Consumers Impacted' },
              { value: '36', label: 'States & UTs' },
            ].map((stat, i) => (
              <div key={stat.label} style={{
                padding: '28px 16px',
                borderRight: i < 3 ? '1px solid #e5e7eb' : 'none',
              }}>
                <div style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#16a34a',
                  lineHeight: 1,
                  letterSpacing: '-1px',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: 13,
                  color: '#9ca3af',
                  marginTop: 6,
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT — white body */}
        <main style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '48px 32px 80px',
        }}>
          <TariffControlPanel />

          <SectionDivider />
          <PriceImpactPanel />

          <SectionDivider />
          <HumanFacePanel />

          <SectionDivider />
          <ConscienceDashboard />

          <SectionDivider />
          <DutyHistoryChart />

          {/* Footer */}
          <footer style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: '1px solid #e5e7eb',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
          }}>
            <BacktestStrip />
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: '#9ca3af',
            }}>
              Built with ♥ for Indian Kisans &amp; Ghars · SummerSaaS 2026
            </div>
          </footer>
        </main>

        <NitiBot />
        <ErrorToast />
        <UpgradeModal />
      </div>
    </SimulationProvider>
  );
}

export default App;
