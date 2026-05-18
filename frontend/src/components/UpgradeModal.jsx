import React, { useState, useEffect } from 'react';

export function UpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-upgrade-modal', handleOpen);
    return () => window.removeEventListener('open-upgrade-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: 16
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        width: '100%',
        maxWidth: 400,
        padding: 32,
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <button 
          onClick={() => setIsOpen(false)}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
            color: '#9ca3af'
          }}
        >
          ×
        </button>

        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 16 }}>
          OilNiti Pro
        </h2>

        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', color: '#374151', fontSize: 15, lineHeight: 1.8 }}>
          <li>✓ Unlimited AI reports</li>
          <li>✓ Custom scenario builder</li>
          <li>✓ All 19 state deep dives</li>
          <li>✓ PDF export</li>
          <li>✓ Global shock inputs</li>
          <li>✓ API access</li>
        </ul>

        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#111' }}>₹999/month <span style={{fontSize: 14, fontWeight: 400, color: '#6b7280'}}>per user</span></div>
          <div style={{ fontSize: 14, color: '#16a34a', fontWeight: 500 }}>₹8,999/year (save 25%)</div>
        </div>

        {submitted ? (
          <div style={{ padding: 16, background: '#dcfce7', color: '#16a34a', borderRadius: 8, textAlign: 'center', fontWeight: 600 }}>
            You're on the waitlist! We'll be in touch soon.
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input 
              type="email" 
              placeholder="Enter your email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid #d1d5db',
                fontSize: 15
              }}
            />
            <button type="submit" className="btn-pro" style={{ justifyContent: 'center', padding: '12px', width: '100%' }}>
              Coming Soon — Join Waitlist
            </button>
          </form>
        )}
        
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button 
            onClick={() => {
              localStorage.setItem('OILNITI_DEMO', 'true');
              window.location.reload();
            }}
            style={{ 
              background: 'none', border: 'none', color: '#9ca3af', 
              fontSize: 12, textDecoration: 'underline', cursor: 'pointer' 
            }}
          >
            Unlock for Demo
          </button>
        </div>
      </div>
    </div>
  );
}
