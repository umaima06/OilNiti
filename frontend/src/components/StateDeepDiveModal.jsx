import React from 'react';
import { ProGate, ProBadge } from './ProGate';

const StateDeepDiveModal = ({ stateData, onClose }) => {
  if (!stateData) return null;

  const isFreeState = stateData.state === 'Rajasthan' || stateData.state === 'Bihar';

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
        maxWidth: 500,
        position: 'relative',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden' // for ProGate
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, right: 16,
            background: 'none', border: 'none', fontSize: 24, cursor: 'pointer',
            color: '#9ca3af',
            zIndex: 100 // above ProGate overlay
          }}
        >
          ×
        </button>

        {isFreeState ? (
          <StateContent stateData={stateData} />
        ) : (
          <ProGate featureName={`${stateData.state} Deep Dive`}>
            <StateContent stateData={stateData} />
          </ProGate>
        )}
      </div>
    </div>
  );
};

const StateContent = ({ stateData }) => {
  const isFarmer = stateData.net === 'farmer';
  const color = isFarmer ? '#16a34a' : stateData.net === 'consumer' ? '#ea580c' : '#d97706';

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ fontSize: 40 }}>{isFarmer ? '🌾' : '🏠'}</div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0, display: 'flex', alignItems: 'center' }}>
            {stateData.state}
            {stateData.state !== 'Rajasthan' && stateData.state !== 'Bihar' && <ProBadge />}
          </h2>
          <div style={{ fontSize: 13, color: color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginTop: 4 }}>
            Net Impact: {stateData.net}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {stateData.farmer_annual_delta !== null && stateData.farmer_annual_delta !== undefined && (
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Farmer Income Δ</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#16a34a', marginTop: 4 }}>+₹{stateData.farmer_annual_delta.toLocaleString('en-IN')}/yr</div>
          </div>
        )}
        
        {stateData.consumer_monthly_delta !== null && stateData.consumer_monthly_delta !== undefined && (
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consumer Cost Δ</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#ea580c', marginTop: 4 }}>+₹{stateData.consumer_monthly_delta.toLocaleString('en-IN')}/mo</div>
          </div>
        )}
        
        {stateData.oilseed_farmers_lakh && (
          <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8, border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Farmers Impacted</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111', marginTop: 4 }}>{stateData.oilseed_farmers_lakh} Lakh</div>
          </div>
        )}
      </div>

      <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.6, background: '#fef3c7', padding: 16, borderRadius: 8, border: '1px solid #fde68a' }}>
        <strong>AI Insight:</strong> {isFarmer 
          ? `High minimum support prices and increased import duties on edible oils provide significant protection to ${stateData.state}'s oilseed farmers, ensuring price realization above production costs.`
          : `Higher import duties directly pass through to retail inflation, disproportionately affecting lower-income households in ${stateData.state} where edible oil forms a larger share of the food basket.`}
      </div>
    </div>
  );
};

export default StateDeepDiveModal;
