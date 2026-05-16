//DutyHistoryChart.jsx

import React, { useState, useEffect } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine
} from 'recharts';
import { API_BASE } from '../config';

const EVENT_ANNOTATIONS = [
  { date: '2018-06-01', label: 'Peak Protection', detail: 'CPO hit 44% — highest in a decade' },
  { date: '2021-10-01', label: 'COVID Relief', detail: 'Slashed to 2.5% to control inflation' },
  { date: '2022-05-01', label: 'Ukraine War', detail: 'Global CPO spiked to $1,580/ton' },
  { date: '2024-01-01', label: 'Duty Hike', detail: 'Restored to 27.5% to protect farmers' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  const event = EVENT_ANNOTATIONS.find(e => e.date === d.date);

  return (
    <div className="tooltip-dark" style={{ minWidth: 200 }}>
      <div style={{ marginBottom: 8, color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: '0.1em' }}>
        {d.date}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>CPO Duty:</span>
        <span style={{ color: '#f59e0b', fontWeight: 600, fontSize: 11 }}>{d.cpo_duty}%</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#6366f1' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>RPO Duty:</span>
        <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 11 }}>{d.rpo_duty}%</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: event ? 8 : 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#10b981' }} />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>Global CPO:</span>
        <span style={{ color: '#10b981', fontWeight: 600, fontSize: 11 }}>${d.global_price}/ton</span>
      </div>
      {event && (
        <div style={{
          marginTop: 6,
          padding: '6px 8px',
          background: 'rgba(245,158,11,0.1)',
          borderRadius: 4,
          border: '1px solid rgba(245,158,11,0.2)',
          fontSize: 10,
          color: '#fbbf24',
        }}>
          📌 {event.label}: {event.detail}
        </div>
      )}
    </div>
  );
};

const DutyHistoryChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/duty-history`)
      .then(r => r.json())
      .then(d => {
        setData(d.timeline || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section style={{ marginBottom: 40 }}>
        <div className="panel-card">
          <div className="skeleton" style={{ height: 300 }} />
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <section style={{ marginBottom: 40 }}>
      <div className="panel-card" style={{
        background: 'linear-gradient(135deg, #0d1325 0%, #111827 100%)',
      }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="section-label">Panel 05 · Historical Context</div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 22,
              fontWeight: 700,
              color: '#e8eaf2',
              marginTop: 4,
            }}>
              India's Duty History Timeline
            </h2>
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.3)',
              marginTop: 6,
              letterSpacing: '0.05em',
            }}>
              A decade of policy volatility — CPO duty swung from 2.5% to 44% and back
            </p>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 3, borderRadius: 2, background: '#f59e0b' }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>CPO Duty %</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 3, borderRadius: 2, background: '#6366f1' }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>RPO Duty %</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 3, borderRadius: 2, background: '#10b981' }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>Global CPO $/ton (right axis)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradCPO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRPO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => v.slice(0, 4)}
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={false}
            />
            <YAxis
              yAxisId="duty"
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: 'rgba(255,255,255,0.35)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
              domain={[0, 60]}
            />
            <YAxis
              yAxisId="price"
              orientation="right"
              tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: 'rgba(255,255,255,0.25)' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
              domain={[400, 1800]}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Event annotation lines */}
            {EVENT_ANNOTATIONS.map(e => (
              <ReferenceLine
                key={e.date}
                x={e.date}
                yAxisId="duty"
                stroke="rgba(245,158,11,0.2)"
                strokeDasharray="3 3"
                label={{
                  value: e.label,
                  position: 'top',
                  style: {
                    fill: 'rgba(245,158,11,0.5)',
                    fontSize: 9,
                    fontFamily: "'IBM Plex Mono', monospace",
                  }
                }}
              />
            ))}

            <Area
              yAxisId="duty"
              type="stepAfter"
              dataKey="cpo_duty"
              name="CPO Duty"
              stroke="#f59e0b"
              strokeWidth={2.5}
              fill="url(#gradCPO)"
              dot={{ fill: '#f59e0b', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#f59e0b', stroke: '#0d1325', strokeWidth: 2 }}
            />
            <Area
              yAxisId="duty"
              type="stepAfter"
              dataKey="rpo_duty"
              name="RPO Duty"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#gradRPO)"
              dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: '#6366f1', stroke: '#0d1325', strokeWidth: 2 }}
            />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="global_price"
              name="Global CPO Price"
              stroke="#10b981"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              fill="none"
              dot={false}
              activeDot={{ r: 4, fill: '#10b981', stroke: '#0d1325', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Key events strip */}
        <div style={{
          marginTop: 20,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
        }}>
          {[
            { year: '2014', duty: '2.5%', label: 'Low duty era begins' },
            { year: '2018', duty: '44%', label: 'Peak protectionism' },
            { year: '2021', duty: '2.5%', label: 'COVID relief cut' },
            { year: '2022', duty: '5%', label: 'Ukraine war chaos' },
            { year: '2024', duty: '27.5%', label: 'Farmer protection hike' },
            { year: '2025', duty: '20%', label: 'Current rate' },
          ].map(e => (
            <div key={e.year} style={{
              padding: '8px 14px',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 12,
                fontWeight: 600,
                color: '#f59e0b',
              }}>
                {e.year} · {e.duty}
              </div>
              <div style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: '0.05em',
              }}>
                {e.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DutyHistoryChart;
