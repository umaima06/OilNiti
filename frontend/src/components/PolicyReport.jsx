//PolicyReport.jsx

import React from 'react';
import { useSimulation } from '../context/SimulationContext';

const PolicyReport = ({ report }) => {
  if (!report) return null;

  return (
    <div style={{
      background: '#f9fafb',
      borderRadius: 12,
      padding: '40px 48px',
      color: '#111827',
      marginTop: 24,
      position: 'relative',
    }}>
      {/* Print header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 32,
        paddingBottom: 24,
        borderBottom: '2px solid #e5e7eb',
      }}>
        <div>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 800,
            color: '#111827',
          }}>
            OilNiti Policy Brief
          </div>
          <div style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 11,
            color: '#6b7280',
            marginTop: 4,
            letterSpacing: '0.08em',
          }}>
            AI-GENERATED · MINISTRY OF FINANCE · EDIBLE OIL TARIFF ANALYSIS
          </div>
        </div>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 10,
          color: '#9ca3af',
          textAlign: 'right',
        }}>
          Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}<br />
          CONFIDENTIAL · DRAFT
        </div>
      </div>

      {/* Executive Summary */}
      <div className="report-section">
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 4, height: 16, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} />
          Executive Summary
        </h3>
        <p style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 15,
          color: '#374151',
          lineHeight: 1.8,
        }}>
          {report.executive_summary}
        </p>
      </div>

      {/* Farmer Welfare */}
      <div className="report-section">
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 4, height: 16, background: '#10b981', borderRadius: 2, display: 'inline-block' }} />
          🌾 Farmer Welfare Impact
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em', borderRadius: '6px 0 0 0' }}>State</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em' }}>Affected Farmers</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em', borderRadius: '0 6px 0 0' }}>Income Delta (₹)</th>
            </tr>
          </thead>
          <tbody>
            {report.farmer_welfare.table.map((row, i) => (
              <tr key={row.state} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px', color: '#111827', fontWeight: 500 }}>{row.state}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#374151' }}>{row.farmers_lakhs} lakh</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#10b981', fontWeight: 600 }}>+₹{row.income_delta.toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Consumer Burden */}
      <div className="report-section">
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 4, height: 16, background: '#ef4444', borderRadius: 2, display: 'inline-block' }} />
          🏠 Consumer Burden Index
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f3f4f6' }}>
              <th style={{ textAlign: 'left', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em', borderRadius: '6px 0 0 0' }}>Income Decile</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em' }}>Monthly Extra Cost (₹)</th>
              <th style={{ textAlign: 'right', padding: '10px 16px', color: '#6b7280', fontWeight: 600, letterSpacing: '0.06em', borderRadius: '0 6px 0 0' }}>% of Income</th>
            </tr>
          </thead>
          <tbody>
            {report.consumer_burden.table.map((row, i) => (
              <tr key={row.decile} style={{ background: i % 2 === 0 ? 'white' : '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '10px 16px', color: '#111827', fontWeight: 500 }}>{row.decile}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>+₹{row.monthly_extra}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right', color: '#374151' }}>{row.pct_income}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommended Duty */}
      <div className="report-section">
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 4, height: 16, background: '#3b82f6', borderRadius: 2, display: 'inline-block' }} />
          ⚡ OilNiti Recommended Duty Rate
        </h3>
        <div style={{
          padding: '20px 24px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #fef3c7, #fff)',
          border: '2px solid #f59e0b',
        }}>
          <div style={{
            display: 'flex',
            gap: 32,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b7280', letterSpacing: '0.1em', marginBottom: 4 }}>RECOMMENDED CPO DUTY</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 700, color: '#d97706' }}>
                {report.recommended_cpo_duty}%
              </div>
            </div>
            <div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: '#6b7280', letterSpacing: '0.1em', marginBottom: 4 }}>RECOMMENDED RPO DUTY</div>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 32, fontWeight: 700, color: '#d97706' }}>
                {report.recommended_rpo_duty}%
              </div>
            </div>
          </div>
          <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
            {report.rationale}
          </p>
        </div>
      </div>

      {/* Fiscal Impact */}
      <div className="report-section" style={{ borderBottom: 'none' }}>
        <h3 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          color: '#374151',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ width: 4, height: 16, background: '#6b7280', borderRadius: 2, display: 'inline-block' }} />
          💰 Fiscal Impact
        </h3>
        <div style={{
          padding: '16px 20px',
          borderRadius: 8,
          background: '#f3f4f6',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: 14,
          color: report.fiscal_impact_crore < 0 ? '#dc2626' : '#16a34a',
        }}>
          Estimated customs revenue change:{' '}
          <strong>
            {report.fiscal_impact_crore < 0 ? '-' : '+'}₹{Math.abs(report.fiscal_impact_crore).toLocaleString('en-IN')} crore
          </strong>
        </div>
      </div>

      {/* Download button */}
      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={() => window.print()}
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 12,
            padding: '10px 20px',
            borderRadius: 7,
            border: '1px solid #d1d5db',
            background: 'white',
            color: '#374151',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
          }}
        >
          ⬇ Download as PDF
        </button>
      </div>
    </div>
  );
};

export default PolicyReport;
