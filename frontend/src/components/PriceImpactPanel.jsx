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
      <div style={{ marginBottom: 6, color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.1em' }}>
        MONTH {label}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>{p.name}:</span>
          <span style={{ color: p.color, fontWeight: 600, fontSize: 11 }}>₹{p.value.toFixed(1)}/L</span>
        </div>
      ))}
    </div>
  );
};

const MetricCard = ({ label, value, sublabel, icon, positive, negative }) => {
  const isPositive = typeof positive === 'boolean' ? positive : (typeof value === 'number' ? value > 0 : null);
  const isNegative = typeof negative === 'boolean' ? negative : false;

  let valueColor = '#e8eaf2';
  if (isPositive === true) valueColor = '#10b981';
  if (isPositive === false || isNegative) valueColor = '#ef4444';

  return (
    <div className="metric-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <div className="section-label" style={{ marginBottom: 0 }}>{label}</div>
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 26,
        fontWeight: 600,
        color: valueColor,
        lineHeight: 1,
        letterSpacing: '-0.01em',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        color: 'rgba(255,255,255,0.35)',
      }}>
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
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
      gap: 16,
    }}>
      <div style={{ fontSize: 48, opacity: 0.3 }}>📊</div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 13,
        color: 'rgba(255,255,255,0.25)',
        letterSpacing: '0.05em',
      }}>
        Adjust the sliders and run a simulation<br />to see price impact signals.
      </div>
    </div>
  );

  const res = simulationResult;

  return (
    <section id="impact" style={{ marginBottom: 40 }}>
      <div className="panel-card">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="section-label">Panel 02 · Market Signal Analysis</div>
          <h2 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: 22,
            fontWeight: 700,
            color: '#e8eaf2',
            marginTop: 4,
          }}>
            Price Impact &amp; Market Signals
          </h2>
        </div>

        {!res && !isLoading ? emptyState : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 32,
          }}
            className="impact-grid"
          >
            {/* Left — Chart */}
            <div>
              <div className="section-label" style={{ marginBottom: 16 }}>Short-Run Price Trajectory (3 months)</div>
              {isLoading ? (
                <div style={{ height: 260 }} className="skeleton" />
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart
                    data={res?.price_trajectory || []}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                    <XAxis
                      dataKey="month"
                      tickFormatter={(v) => `M${v}`}
                      tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                      tickLine={false}
                      label={{ value: 'Month', position: 'insideBottomRight', offset: -4, style: { fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" } }}
                    />
                    <YAxis
                      tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                      domain={['auto', 'auto']}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, paddingTop: 12 }}
                    />
                    <ReferenceLine
                      y={BASELINE_PALM}
                      stroke="rgba(245,158,11,0.3)"
                      strokeDasharray="6 3"
                      label={{ value: 'Pre-change (Palm)', position: 'right', style: { fill: 'rgba(245,158,11,0.5)', fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" } }}
                    />
                    <ReferenceLine
                      y={BASELINE_MUSTARD}
                      stroke="rgba(59,130,246,0.3)"
                      strokeDasharray="6 3"
                      label={{ value: 'Pre-change (Mustard)', position: 'right', style: { fill: 'rgba(59,130,246,0.5)', fontSize: 9, fontFamily: "'IBM Plex Mono', monospace" } }}
                    />
                    <Line
                      type="monotone"
                      dataKey="palm_price"
                      name="Palm Oil"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      dot={{ fill: '#f59e0b', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#f59e0b', stroke: '#0d1325', strokeWidth: 2 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="mustard_price"
                      name="Mustard Oil"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 6, fill: '#3b82f6', stroke: '#0d1325', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              <div style={{
                marginTop: 12,
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: '#f59e0b' }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Palm Oil (₹/litre)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: '#3b82f6' }} />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Mustard Oil (₹/litre) — substitution effect</span>
                </div>
              </div>
            </div>

            {/* Right — Metric cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignContent: 'start' }}>
              {isLoading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <MetricCard
                    label="Domestic Price Change"
                    icon="📈"
                    value={`${res.domestic_price_change > 0 ? '+' : ''}₹${res.domestic_price_change.toFixed(1)}/L`}
                    sublabel="vs. pre-duty baseline"
                    positive={res.domestic_price_change < 0}
                    negative={res.domestic_price_change > 0}
                  />
                  <MetricCard
                    label="Import Volume Change"
                    icon="🚢"
                    value={`${res.import_volume_change > 0 ? '+' : ''}${res.import_volume_change}%`}
                    sublabel="change in CPO imports"
                    positive={res.import_volume_change < 0}
                    negative={res.import_volume_change > 0}
                  />
                  <MetricCard
                    label="Substitution Effect"
                    icon="🌻"
                    value={`+${res.substitution_effect.toFixed(1)}%`}
                    sublabel="mustard demand increase"
                    positive={true}
                  />
                  <MetricCard
                    label="Ātma Nirbhar Score"
                    icon="🏭"
                    value={`${res.atma_nirbhar_before}% → ${res.atma_nirbhar_after}%`}
                    sublabel="domestic production share"
                    positive={res.atma_nirbhar_after > res.atma_nirbhar_before}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          .impact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};

export default PriceImpactPanel;
