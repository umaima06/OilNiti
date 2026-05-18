import React, { useState } from 'react';
import { DEMO_MODE, IS_PRO } from '../config';
import { openUpgradeModal, ProBadge } from './ProGate';

const ApiAccess = () => {
  const isProUnlocked = DEMO_MODE || IS_PRO;
  const [keyGenerated, setKeyGenerated] = useState(false);

  const handleGenerate = () => {
    if (!isProUnlocked) {
      openUpgradeModal();
    } else {
      setKeyGenerated(true);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '64px auto', padding: '0 32px' }}>
      <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111', letterSpacing: '-1px', marginBottom: 16 }}>OilNiti API</h1>
      <p style={{ fontSize: 18, color: '#555', lineHeight: 1.6, marginBottom: 48 }}>
        Integrate India's first policy conscience engine directly into your enterprise workflows. Run massive batch simulations and extract causal insights programmatically.
      </p>

      <div style={{ background: '#f9fafb', borderRadius: 12, border: '1px solid #e5e7eb', padding: 32, marginBottom: 32 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111', marginBottom: 16, display: 'flex', alignItems: 'center' }}>API Keys <ProBadge /></h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          Authenticate your requests using a Bearer token in the Authorization header. Do not share your API key in publicly accessible areas.
        </p>
        
        {keyGenerated ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Name</label>
              <input type="text" placeholder="Jane Doe" style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Organisation</label>
              <input type="text" placeholder="Acme Policy Group" style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Use Case</label>
              <textarea placeholder="How do you plan to use the OilNiti API?" rows={3} style={{ width: '100%', padding: '10px 14px', borderRadius: 6, border: '1px solid #d1d5db', resize: 'vertical' }}></textarea>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn-primary" style={{ padding: '10px 24px' }} onClick={() => { alert('Request submitted! Our team will contact you shortly.'); setKeyGenerated(false); }}>Submit Request</button>
              <button className="btn-ghost" onClick={() => setKeyGenerated(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button 
            className="btn-primary" 
            style={{ padding: '12px 24px' }}
            onClick={handleGenerate}
          >
            {isProUnlocked ? 'Request API Key →' : '🔒 Upgrade to Pro to Generate Key'}
          </button>
        )}
      </div>

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #e5e7eb', padding: '16px 24px', background: '#f9fafb' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111' }}>Endpoints</h2>
        </div>
        
        <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>POST</span>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#111' }}>/api/v1/simulate</span>
          </div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>Run a full causal impact simulation across all 36 states and UTs.</p>
          <pre style={{ background: '#111', color: '#a78bfa', padding: 16, borderRadius: 8, fontSize: 13, overflowX: 'auto', fontFamily: "'IBM Plex Mono', monospace" }}>
<span style={{ color: '#818cf8' }}>curl</span> -X POST https://api.oilniti.in/v1/simulate \<br/>
  -H <span style={{ color: '#34d399' }}>"Authorization: Bearer YOUR_API_KEY"</span> \<br/>
  -H <span style={{ color: '#34d399' }}>"Content-Type: application/json"</span> \<br/>
  -d <span style={{ color: '#fcd34d' }}>'{'{'}"cpo_duty": 20, "rpo_duty": 32.5, "global_shock": 0{'}'}'</span>
          </pre>
        </div>
        
        <div style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ background: '#dbeafe', color: '#2563eb', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, fontFamily: "'IBM Plex Mono', monospace" }}>GET</span>
            <span style={{ fontSize: 15, fontWeight: 600, fontFamily: "'IBM Plex Mono', monospace", color: '#111' }}>/api/v1/report</span>
          </div>
          <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>Retrieve an AI-generated policy brief for a specific simulation run.</p>
        </div>
      </div>
    </div>
  );
};

export default ApiAccess;
