import React, { useState } from 'react';
import { DEMO_MODE, IS_PRO } from '../config';

// A simple global state/event system for the upgrade modal
export const openUpgradeModal = () => {
  const event = new Event('open-upgrade-modal');
  window.dispatchEvent(event);
};

export function ProGate({ children, featureName }) {
  if (DEMO_MODE || IS_PRO) return children;
  
  return (
    <div className="pro-gate">
      <div className="blurred-content">{children}</div>
      <div className="lock-overlay">
        <span>🔒</span>
        <h3>{featureName}</h3>
        <p>Available in Pro Plan</p>
        <button className="btn-pro" onClick={openUpgradeModal}>
          Upgrade to Pro →
        </button>
      </div>
    </div>
  );
}

export function ProBadge() {
  return <span className="pro-badge" style={{ display: 'inline-flex', alignItems: 'center', background: 'linear-gradient(135deg, #fef3c7, #fef08a)', color: '#d97706', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', border: '1px solid #fde047', marginLeft: 8 }}>✦ PRO</span>;
}
