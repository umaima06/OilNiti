//Header.jsx
import { useState, useEffect, React } from 'react';
const Header = () => {
  const [livePrice, setLivePrice] = useState(null);
  
  useEffect(() => {
    fetch('http://localhost:8000/live-price')
    .then(r => r.json())
    .then(setLivePrice)
    .catch(() => {});
  }, []);

  return (
    <header style={{
      background: 'linear-gradient(180deg, #080c18 0%, #0a0e1a 100%)',
      borderBottom: '1px solid #1e2d45',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 72,
        gap: 16,
      }}>
        {/* Logo + tagline */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo mark */}
          <div style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 16px rgba(245,158,11,0.4)',
          }}>
            <span style={{ fontSize: 22 }}>🛢</span>
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 26,
              fontWeight: 800,
              color: '#f59e0b',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}>
              OilNiti
            </div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.35)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginTop: 3,
              whiteSpace: 'nowrap',
            }}>
              India's Policy Conscience Machine · Edible Oil Tariffs
            </div>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Ministry badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 6,
            border: '1px solid rgba(245,158,11,0.2)',
            background: 'rgba(245,158,11,0.05)',
          }}>
            <span style={{ fontSize: 14 }}>🇮🇳</span>
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em',
            }}>
              Ministry of Finance · Trade Wing
            </span>
          </div>

          {/* Live price badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 8,
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}>
            <span className="live-dot" aria-hidden="true" />
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 12,
              fontWeight: 600,
              color: '#34d399',
              }}>
                Global CPO: ₹{livePrice?.price_inr_per_kg ?? '...'}/kg {livePrice?.trend_icon ?? ''}
            </span>
            
            <span style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              color: 'rgba(255,255,255,0.3)',
            }}>
              · Live
            </span>
          </div>
        </div>
      </div>

      {/* Sub-nav strip */}
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        display: 'flex',
        gap: 0,
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}>
        {[
          { label: 'TARIFF CONTROL', href: '#control' },
          { label: 'PRICE IMPACT', href: '#impact' },
          { label: 'HUMAN FACE', href: '#human' },
          { label: 'AI CONSCIENCE', href: '#conscience' },
        ].map((item) => (
          <a
            key={item.label}
            href={item.href}
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 10,
              letterSpacing: '0.15em',
              color: 'rgba(255,255,255,0.3)',
              textDecoration: 'none',
              padding: '8px 20px',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.color = '#f59e0b'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.3)'}
          >
            {item.label}
          </a>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 9,
          color: 'rgba(255,255,255,0.15)',
          padding: '8px 20px',
          letterSpacing: '0.1em',
        }}>
          SUMMERSAAS 2026 · OPEN INNOVATION
        </div>
      </div>
    </header>
  );
};

export default Header;
