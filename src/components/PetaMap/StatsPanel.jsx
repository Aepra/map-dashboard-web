import React from 'react';

/**
 * Stats Panel - Minimalist Statistics
 */
export const StatsPanel = ({ stats }) => {
  return (
    <div className="absolute bottom-4 right-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm z-40 pointer-events-none border border-gray-200 px-3 py-2.5">
      <div className="grid grid-cols-4 gap-3">
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">Total</div>
          <div className="text-sm font-bold text-gray-900">{(stats.total / 1000).toFixed(1)}K</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🔴 SD</div>
          <div className="text-sm font-bold text-red-600">{(stats.sd / 1000).toFixed(1)}K</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🔵 SMP</div>
          <div className="text-sm font-bold text-blue-600">{(stats.smp / 1000).toFixed(1)}K</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🟡 PAUD</div>
          <div className="text-sm font-bold text-yellow-600">{stats.paud}</div>
        </div>
      </div>
    </div>
  );
};
