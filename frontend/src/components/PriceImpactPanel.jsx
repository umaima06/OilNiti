//PriceImpactPanel.jsx

import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend
} from 'recharts';
import { useSimulation } from '../context/SimulationContext';
import { SkeletonCard } from './SkeletonLoader';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-dark">
      <div style={{ marginBottom: 6, color: '#9ca3af', fontSize: 10, letterSpacing: '1px', fontFamily: "'IBM Plex Mono', monospace" }}>
        MONTH {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ color: '#555', fontSize: 12 }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600, fontSize: 12, fontFamily: "'IBM Plex Mono', monospace" }}>₹{p.value.toFixed(1)}/L</span>
        </div>
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, sublabel, icon, positive, negative }) => {
  const isPositive = typeof positive === 'boolean' ? positive : (typeof value === 'number' ? value > 0 : null);
  const isNegative = typeof negative === 'boolean' ? negative : false;

  let valueColor = '#111';
  if (isPositive === true) valueColor = '#16a34a';
  if (isPositive === false || isNegative) valueColor = '#dc2626';

  return (
    <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <div style={{ fontSize: 11, fontWeight: 500, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 24,
        fontWeight: 700,
        color: valueColor,
        lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af' }}>
        {sublabel}
      </div>
    </div>
  );
};

const BASELINE_PALM = 130;
const BASELINE_MUSTARD = 175;

const PriceImpactPanel = () => {
  const { simulationResult, isLoading } = useSimulation();

  const emptyState = (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '64px 32px', textAlign: 'center', gap: 12,
    }}>
      <div style={{ fontSize: 48, opacity: 0.2 }}>📊</div>
      <div style={{ fontSize: 14, color: '#9ca3af' }}>
        Adjust the sliders and run a simulation<br />to see price impact signals.
      </div>
    </div>
  );

  const res = simulationResult;

  return (
    <section id="impact" style={{ marginBottom: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>
          Price Impact &amp; Market Signals
        </h2>
      </div>

      <div className="panel-card">
        {!res && !isLoading ? emptyState : (
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 32 }} className="impact-grid">
            {/* Left — Chart */}
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>Price Trajectory (3 months)</div>
              {isLoading ? (
                <div style={{ height: 380 }} className="skeleton" />
              ) : (
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={res?.price_trajectory || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(v) => `M${v}`}
                      tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#9ca3af' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={BASELINE_PALM} stroke="#16a34a80" strokeDasharray="6 3" />
                    <ReferenceLine y={BASELINE_MUSTARD} stroke="#2563eb80" strokeDasharray="6 3" />
                    <Line type="monotone" dataKey="palm_price" name="Palm Oil" stroke="#16a34a" strokeWidth={2.5}
                      dot={{ fill: '#16a34a', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="mustard_price" name="Mustard Oil" stroke="#2563eb" strokeWidth={2.5}
                      dot={{ fill: '#2563eb', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Right — Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
              {isLoading ? (
                <><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
              ) : (
                <>
                  <MetricCard label="Price Change" icon="📈" value={`${res.domestic_price_change > 0 ? '+' : ''}₹${res.domestic_price_change.toFixed(1)}/L`} sublabel="vs. baseline" positive={res.domestic_price_change < 0} negative={res.domestic_price_change > 0} />
                  <MetricCard label="Import Volume" icon="🚢" value={`${res.import_volume_change > 0 ? '+' : ''}${res.import_volume_change}%`} sublabel="CPO imports" positive={res.import_volume_change < 0} negative={res.import_volume_change > 0} />
                  <MetricCard label="Substitution" icon="🌻" value={`+${res.substitution_effect.toFixed(1)}%`} sublabel="mustard demand" positive={true} />
                  <MetricCard label="Ātma Nirbhar" icon="🏭" value={`${res.atma_nirbhar_before}% → ${res.atma_nirbhar_after}%`} sublabel="domestic share" positive={res.atma_nirbhar_after > res.atma_nirbhar_before} />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .impact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
};

export default PriceImpactPanel;
