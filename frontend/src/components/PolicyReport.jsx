//PolicyReport.jsx
import React, { useRef, useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactMarkdown from 'react-markdown';

const PolicyReport = ({ report }) => {
  const { cpoDuty, rpoDuty } = useSimulation();
  const reportRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!report) return null;

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff',
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      
      // Calculate PDF dimensions (A4-ish, scale to fit)
      const pdfWidth = 595; // A4 width in points
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: [pdfWidth, pdfHeight],
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Manual blob download to guarantee correct filename
      const fileName = `OilNiti_Report_CPO${cpoDuty}_RPO${rpoDuty}.pdf`;
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const markdownContent = typeof report === 'string' ? report : (report.report || '');

  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '40px 48px',
      color: '#111', marginTop: 24, border: '1px solid #e5e7eb',
    }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
        <button 
          onClick={handleDownloadPDF} disabled={isExporting}
          style={{
            background: '#16a34a', color: '#fff',
            border: 'none', padding: '8px 18px', borderRadius: 8,
            fontSize: 13, fontWeight: 600,
            cursor: isExporting ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => !isExporting && (e.target.style.background = '#15803d')}
          onMouseLeave={e => e.target.style.background = '#16a34a'}
        >
          📄 {isExporting ? 'Generating PDF...' : 'Download PDF'}
        </button>
      </div>

      <div ref={reportRef} style={{ background: '#fff', padding: '40px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
        <div className="markdown-body" style={{
          fontFamily: "'Inter', sans-serif", fontSize: '14px',
          lineHeight: '1.8', color: '#374151'
        }}>
          <ReactMarkdown>{markdownContent}</ReactMarkdown>
        </div>
      </div>

      <style>{`
        .markdown-body h1, .markdown-body h2, .markdown-body h3 {
          font-family: 'Inter', sans-serif;
          color: #111;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .markdown-body h1 {
          font-size: 24px;
          font-weight: 800;
          border-bottom: 2px solid #16a34a;
          padding-bottom: 12px;
          letter-spacing: -0.5px;
        }
        .markdown-body h2 {
          font-size: 18px;
          font-weight: 700;
          color: #16a34a;
          margin-top: 2em;
        }
        .markdown-body h3 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #374151;
        }
        .markdown-body p { margin-bottom: 1em; }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 20px; }
        .markdown-body li { margin-bottom: 0.5em; }
        .markdown-body table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 1.5em;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
        }
        .markdown-body th, .markdown-body td {
          border: 1px solid #e5e7eb;
          padding: 10px 14px;
          text-align: left;
        }
        .markdown-body th {
          background: #f0fdf4;
          color: #16a34a;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .markdown-body td {
          color: #374151;
        }
        .markdown-body tr:nth-child(even) td {
          background: #f9fafb;
        }
        .markdown-body strong { font-weight: 700; color: #111; }
        .markdown-body hr {
          border: none;
          border-top: 1px dashed #d1d5db;
          margin: 2em 0;
        }
        .markdown-body blockquote {
          border-left: 3px solid #16a34a;
          padding: 8px 16px;
          margin: 1em 0;
          background: #f0fdf4;
          color: #14532d;
          font-style: italic;
        }
        .markdown-body code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 12px;
          color: #16a34a;
        }
      `}</style>
    </div>
  );
};

export default PolicyReport;
