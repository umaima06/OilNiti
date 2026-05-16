//SkeletonLoader.jsx

import React from 'react';

const SkeletonLoader = ({ width = '100%', height = 20, className = '' }) => (
  <div
    className={`skeleton ${className}`}
    style={{ width, height, borderRadius: 6 }}
    aria-hidden="true"
  />
);

export const SkeletonBlock = ({ lines = 3, className = '' }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <SkeletonLoader key={i} height={16} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export const SkeletonCard = ({ className = '' }) => (
  <div className={`metric-card ${className}`} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
    <SkeletonLoader height={12} width="40%" />
    <SkeletonLoader height={36} width="60%" />
    <SkeletonLoader height={14} width="80%" />
  </div>
);

export default SkeletonLoader;
