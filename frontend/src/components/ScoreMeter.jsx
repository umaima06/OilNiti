//ScoreMeter.jsx
import React, { useEffect, useRef } from 'react';

const ScoreMeter = ({ value = 0, max = 100, color = '#16a34a', label = '', size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const dashOffset = circumference * (1 - pct);
  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDashoffset = circumference;
    const frame = requestAnimationFrame(() => {
      circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      circleRef.current.style.strokeDashoffset = dashOffset;
    });
    return () => cancelAnimationFrame(frame);
  }, [value, dashOffset, circumference]);

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
      role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={strokeWidth} strokeLinecap="round" />
          <circle ref={circleRef} cx={cx} cy={cy} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: size * 0.2, fontWeight: 800, color: '#111', lineHeight: 1 }}>{Math.round(value)}</span>
          <span style={{ fontSize: size * 0.08, color: '#9ca3af', lineHeight: 1, marginTop: 4 }}>/ {max}</span>
        </div>
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#555', textAlign: 'center', maxWidth: size }}>{label}</div>
    </div>
  );
};

export default ScoreMeter;
