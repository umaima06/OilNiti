//ScoreMeter.jsx

import React, { useEffect, useRef } from 'react';

const ScoreMeter = ({ value = 0, max = 100, color = '#f59e0b', label = '', size = 160, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const dashOffset = circumference * (1 - pct);

  const circleRef = useRef(null);

  useEffect(() => {
    if (!circleRef.current) return;
    // Animate from current to new value
    circleRef.current.style.strokeDashoffset = circumference;
    const frame = requestAnimationFrame(() => {
      circleRef.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)';
      circleRef.current.style.strokeDashoffset = dashOffset;
    });
    return () => cancelAnimationFrame(frame);
  }, [value, dashOffset, circumference]);

  const cx = size / 2;
  const cy = size / 2;

  // Color for text
  const textColor = color;

  // Background arc color
  const trackColor = 'rgba(255,255,255,0.06)';

  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          <circle
            ref={circleRef}
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{
              filter: `drop-shadow(0 0 6px ${color}80)`,
            }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: size * 0.18,
            fontWeight: 600,
            color: textColor,
            lineHeight: 1,
          }}>
            {Math.round(value)}
          </span>
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: size * 0.08,
            color: 'rgba(255,255,255,0.4)',
            lineHeight: 1,
            marginTop: 4,
          }}>
            / {max}
          </span>
        </div>
      </div>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.5)',
        textAlign: 'center',
        maxWidth: size,
        lineHeight: 1.4,
      }}>
        {label}
      </div>
    </div>
  );
};

export default ScoreMeter;
