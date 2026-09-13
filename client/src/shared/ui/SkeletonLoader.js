import React from 'react';

/** @param {{ rows?: number, height?: string }} props */
export function SkeletonLoader({ rows = 3, height = 'h-16' }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className={`${height} bg-surfaceElevated rounded-lg animate-pulse`} />
      ))}
    </div>
  );
}
