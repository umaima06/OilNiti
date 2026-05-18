//Header.jsx
import { useState, useEffect, React } from 'react';
import { API_BASE } from '../config';
const Header = () => {
  const [livePrice, setLivePrice] = useState(null);
  
  useEffect(() => {
    fetch(`${API_BASE}/live-price`)
    .then(r => r.json())
    .then(setLivePrice)
    .catch(() => {});
  }, []);

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        gap: 16,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>🛢</span>
          <div style={{
            fontSize: 22,
            fontWeight: 800,
            color: '#111',
            letterSpacing: '-0.5px',
            lineHeight: 1,
          }}>
            Oil<span style={{ color: '#16a34a' }}>Niti</span>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {[
            { label: 'Control', href: '/#control' },
            { label: 'Impact', href: '/#impact' },
            { label: 'Human Face', href: '/#human' },
            { label: 'AI Insights', href: '/#conscience' },
            { label: 'API Access', href: '/api-access' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#555',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = '#16a34a'}
              onMouseLeave={(e) => e.target.style.color = '#555'}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Live price */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            fontWeight: 500,
            color: '#16a34a',
          }}>
            <span className="live-dot" aria-hidden="true" />
            CPO: ₹{livePrice?.price_inr_per_kg ?? '...'}/kg {livePrice?.trend_icon ?? ''}
          </div>

          {/* CTA button */}
          <a
            href="#conscience"
            style={{
              background: '#16a34a',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 8,
              textDecoration: 'none',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.background = '#15803d'}
            onMouseLeave={(e) => e.target.style.background = '#16a34a'}
          >
            Generate Report →
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
