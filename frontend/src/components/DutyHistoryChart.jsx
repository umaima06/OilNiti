//DutyHistoryChart.jsx
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { API_BASE } from '../config';

const EVENT_ANNOTATIONS = [
  { date: '2018-06-01', label: 'Peak Protection', detail: 'CPO hit 44% — highest in a decade' },
  { date: '2021-10-01', label: 'COVID Relief', detail: 'Slashed to 2.5% to control inflation' },
  { date: '2022-05-01', label: 'Ukraine War', detail: 'Global CPO spiked to $1,580/ton' },
  { date: '2024-01-01', label: 'Duty Hike', detail: 'Restored to 27.5% to protect farmers' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const event = EVENT_ANNOTATIONS.find(e => e.date === d.date);
  return (
    <div className="tooltip-dark">
      <div style={{ marginBottom: 6, color: '#9ca3af', fontSize: 10, letterSpacing: '1px', fontFamily: "'IBM Plex Mono', monospace" }}>{d.date}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#16a34a' }} />
        <span style={{ color: '#555', fontSize: 12 }}>CPO Duty:</span>
        <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 12 }}>{d.cpo_duty}%</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#2563eb' }} />
        <span style={{ color: '#555', fontSize: 12 }}>RPO Duty:</span>
        <span style={{ color: '#2563eb', fontWeight: 600, fontSize: 12 }}>{d.rpo_duty}%</span>
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: event ? 8 : 0 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#ea580c' }} />
        <span style={{ color: '#555', fontSize: 12 }}>Global CPO:</span>
        <span style={{ color: '#ea580c', fontWeight: 600, fontSize: 12 }}>${d.global_price}/ton</span>
      </div>
      {event && <div style={{ marginTop: 6, padding: '6px 8px', background: '#f0fdf4', borderRadius: 4, border: '1px solid #bbf7d0', fontSize: 11, color: '#16a34a' }}>📌 {event.label}: {event.detail}</div>}
    </div>
  );
};

const DutyHistoryChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/duty-history`).then(r => r.json()).then(d => { setData(d.timeline || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <section style={{ marginBottom: 0 }}><div className="panel-card"><div className="skeleton" style={{ height: 300 }} /></div></section>;
  if (!data || data.length === 0) return null;

  return (
    <section style={{ marginBottom: 0 }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: '#111', letterSpacing: '-0.5px' }}>Duty History Timeline</h2>
        <p style={{ fontSize: 15, color: '#555', marginTop: 6 }}>A decade of policy volatility — CPO duty swung from 2.5% to 44% and back</p>
      </div>

      <div className="panel-card">
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
          {[{ c: '#16a34a', l: 'CPO Duty %' }, { c: '#2563eb', l: 'RPO Duty %' }, { c: '#ea580c', l: 'Global CPO $/ton' }].map(x => (
            <div key={x.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 14, height: 3, borderRadius: 2, background: x.c }} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>{x.l}</span>
            </div>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradCPO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gradRPO" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="4 4" />
            <XAxis dataKey="date" tickFormatter={(v) => v.slice(0, 4)} tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: '#9ca3af' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
            <YAxis yAxisId="duty" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 60]} />
            <YAxis yAxisId="price" orientation="right" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} domain={[400, 1800]} />
            <Tooltip content={<CustomTooltip />} />
            {EVENT_ANNOTATIONS.map(e => <ReferenceLine key={e.date} x={e.date} yAxisId="duty" stroke="#16a34a40" strokeDasharray="3 3" label={{ value: e.label, position: 'top', style: { fill: '#16a34a', fontSize: 9 } }} />)}
            <Area yAxisId="duty" type="stepAfter" dataKey="cpo_duty" stroke="#16a34a" strokeWidth={2.5} fill="url(#gradCPO)" dot={{ fill: '#16a34a', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#16a34a', stroke: '#fff', strokeWidth: 2 }} />
            <Area yAxisId="duty" type="stepAfter" dataKey="rpo_duty" stroke="#2563eb" strokeWidth={2} fill="url(#gradRPO)" dot={{ fill: '#2563eb', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }} />
            <Area yAxisId="price" type="monotone" dataKey="global_price" stroke="#ea580c" strokeWidth={1.5} strokeDasharray="4 3" fill="none" dot={false} activeDot={{ r: 4, fill: '#ea580c', stroke: '#fff', strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>

        <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { year: '2014', duty: '2.5%', label: 'Low duty era' },
            { year: '2018', duty: '44%', label: 'Peak protectionism' },
            { year: '2021', duty: '2.5%', label: 'COVID relief cut' },
            { year: '2022', duty: '5%', label: 'Ukraine war chaos' },
            { year: '2024', duty: '27.5%', label: 'Farmer protection hike' },
            { year: '2025', duty: '20%', label: 'Current rate' },
          ].map(e => (
            <div key={e.year} style={{ padding: '8px 14px', borderRadius: 8, background: '#f9fafb', border: '1px solid #e5e7eb' }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, fontWeight: 700, color: '#16a34a' }}>{e.year} · {e.duty}</div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{e.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DutyHistoryChart;
