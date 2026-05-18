//IndiaMap.jsx

import React, { useState, useCallback, memo } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps';
import { useSimulation } from '../context/SimulationContext';

// India states GeoJSON (local file in /public)
const GEO_URL = '/india-states.json';

// Map state names from GeoJSON to our state_impact keys
const NORMALIZE = (name) => {
  const map = {
    // States
    'Jammu and Kashmir': 'Jammu & Kashmir',
    'Jammu & Kashmir': 'Jammu & Kashmir',
    'Himachal Pradesh': 'Himachal Pradesh',
    'Punjab': 'Punjab',
    'Uttarakhand': 'Uttarakhand',
    'Uttaranchal': 'Uttarakhand',
    'Haryana': 'Haryana',
    'Delhi': 'Delhi',
    'NCT of Delhi': 'Delhi',
    'Rajasthan': 'Rajasthan',
    'Uttar Pradesh': 'Uttar Pradesh',
    'Bihar': 'Bihar',
    'Sikkim': 'Sikkim',
    'Arunachal Pradesh': 'Arunachal Pradesh',
    'Nagaland': 'Nagaland',
    'Manipur': 'Manipur',
    'Mizoram': 'Mizoram',
    'Tripura': 'Tripura',
    'Meghalaya': 'Meghalaya',
    'Assam': 'Assam',
    'West Bengal': 'West Bengal',
    'Jharkhand': 'Jharkhand',
    'Odisha': 'Odisha',
    'Orissa': 'Odisha',
    'Chhattisgarh': 'Chhattisgarh',
    'Madhya Pradesh': 'Madhya Pradesh',
    'Gujarat': 'Gujarat',
    'Maharashtra': 'Maharashtra',
    'Andhra Pradesh': 'Andhra Pradesh',
    'Telangana': 'Telangana',
    'Karnataka': 'Karnataka',
    'Goa': 'Goa',
    'Kerala': 'Kerala',
    'Tamil Nadu': 'Tamil Nadu',
    // Union Territories
    'Ladakh': 'Ladakh',
    'Puducherry': 'Puducherry',
    'Pondicherry': 'Puducherry',
    'Chandigarh': 'Chandigarh',
    'Dadra and Nagar Haveli and Daman and Diu': 'Dadra Nagar Haveli',
    'Dadra and Nagar Haveli': 'Dadra Nagar Haveli',
    'Dadra & Nagar Haveli': 'Dadra Nagar Haveli',
    'Daman and Diu': 'Dadra Nagar Haveli',
    'Daman & Diu': 'Dadra Nagar Haveli',
    'DNH and DD': 'Dadra Nagar Haveli',
    'Andaman and Nicobar Islands': 'Andaman & Nicobar',
    'Andaman and Nicobar': 'Andaman & Nicobar',
    'Andaman & Nicobar Islands': 'Andaman & Nicobar',
    'Lakshadweep': 'Lakshadweep',
    // Mumbai is in our data but not a separate GeoJSON region
    'Mumbai': 'Mumbai',
  };
  return map[name] || name;
};

const getStateColor = (stateData, defaultMode) => {
  if (!stateData) {
    return defaultMode ? '#e5e7eb' : '#d1d5db';
  }
  const { net, magnitude } = stateData;
  if (net === 'farmer') {
    const alpha = 0.3 + magnitude * 0.7;
    return `rgba(22,163,74,${alpha})`;
  }
  if (net === 'consumer') {
    const alpha = 0.3 + magnitude * 0.7;
    return `rgba(234,88,12,${alpha})`;
  }
  if (net === 'mixed') {
    const alpha = 0.3 + magnitude * 0.7;
    return `rgba(245,158,11,${alpha})`;
  }
  return '#e5e7eb';
};

const TooltipBox = memo(({ tooltip }) => {
  if (!tooltip) return null;
  const { x, y, state, data } = tooltip;
  return (
    <div
      className="tooltip-dark"
      style={{
        position: 'fixed',
        left: x + 12,
        top: y - 10,
        pointerEvents: 'none',
        zIndex: 1000,
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 700, color: '#111', marginBottom: 8, fontSize: 13 }}>
        {state}
      </div>
      {data ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ color: '#9ca3af' }}>Net Impact</span>
            <span style={{
              color: data.net === 'farmer' ? '#16a34a' : data.net === 'consumer' ? '#ea580c' : '#d97706',
              fontWeight: 600,
              textTransform: 'capitalize',
            }}>
              {data.net === 'farmer' ? '🌾 Farmer' : data.net === 'consumer' ? '🏠 Consumer' : '⚖ Mixed'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ color: '#9ca3af' }}>Farmer Δ/yr</span>
            <span style={{ color: '#16a34a' }}>
              +₹{(data.farmer_annual_delta ?? Math.round(data.magnitude * 3200)).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
            <span style={{ color: '#9ca3af' }}>Consumer Δ/mo</span>
            <span style={{ color: '#ea580c' }}>
              +₹{Math.round(data.consumer_monthly_delta ?? data.magnitude * 287)}
            </span>
          </div>
          {data.oilseed_farmers_lakh && (
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
              <span style={{ color: '#9ca3af' }}>Farmers</span>
              <span style={{ color: '#111' }}>{data.oilseed_farmers_lakh}L</span>
            </div>
          )}
        </>
      ) : (
        <div style={{ color: '#9ca3af', fontSize: 11 }}>No impact data available</div>
      )}
    </div>
  );
});

const IndiaMap = ({ onStateClick }) => {
  const { simulationResult } = useSimulation();
  const [tooltip, setTooltip] = useState(null);

  const stateImpactMap = simulationResult
    ? Object.fromEntries((simulationResult.state_impact || []).map((s) => [s.state, s]))
    : null;

  const handleMouseMove = useCallback((geo, evt) => {
    const stateName = geo.properties.NAME_1 || geo.properties.name || geo.properties.ST_NM || '';
    const normalized = NORMALIZE(stateName);
    setTooltip({
      x: evt.clientX,
      y: evt.clientY,
      state: normalized,
      data: stateImpactMap ? stateImpactMap[normalized] || null : null,
    });
  }, [stateImpactMap]);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div>
      {/* Map header */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="section-label">Spatial Impact Distribution</div>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#111',
            marginTop: 4,
          }}>
            State-by-State Impact Distribution
          </h3>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(16,185,129,0.8)' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#555' }}>Farmer benefit</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(239,68,68,0.8)' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#555' }}>Consumer burden</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: 'rgba(245,158,11,0.8)' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#555' }}>Mixed impact</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: '#e5e7eb' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: '#555' }}>No data</span>
          </div>
        </div>
      </div>

      {!simulationResult && (
        <div style={{
          textAlign: 'center',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 12,
          color: '#9ca3af',
          marginBottom: 12,
          padding: '8px 16px',
          background: '#fff',
          borderRadius: 6,
          border: '1px solid #e5e7eb',
        }}>
          Move the sliders and run a simulation to see human impact across India's states.
        </div>
      )}

      {/* Map container */}
      <div style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        position: 'relative',
      }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            center: [82, 22],
            scale: 800,
          }}
          style={{ width: '100%', height: 'auto' }}
          viewBox="0 0 800 600"
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const rawName = geo.properties.NAME_1 || geo.properties.name || geo.properties.ST_NM || '';
                const normalized = NORMALIZE(rawName);
                const stateData = stateImpactMap ? stateImpactMap[normalized] || null : null;
                const fill = getStateColor(stateData, !simulationResult);
                const isHighlighted = stateData !== null && stateData !== undefined;

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#d1d5db"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none',
                        transition: 'fill 0.3s ease',
                      },
                      hover: {
                        fill: stateData
                          ? (stateData.net === 'farmer' ? '#4ade80'
                            : stateData.net === 'consumer' ? '#fb923c'
                            : '#fbbf24')
                          : '#d1d5db',
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: { outline: 'none' },
                    }}
                    onMouseMove={(evt) => handleMouseMove(geo, evt)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => {
                      if (onStateClick && stateData) {
                        onStateClick(stateData);
                      } else if (onStateClick) {
                        onStateClick({
                          state: normalized,
                          net: 'consumer', // fallback
                          magnitude: 0,
                          farmer_annual_delta: 0,
                          consumer_monthly_delta: 0
                        });
                      }
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
      </div>

      <TooltipBox tooltip={tooltip} />
    </div>
  );
};

export default IndiaMap;
