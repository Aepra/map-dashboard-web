import React from 'react';

const COLOR_MAP = {
  SD: 'text-orange-600',
  SMP: 'text-blue-600',
  PAUD: 'text-yellow-600',
};

const formatK = (num) => {
  if (!num) return '0';
  return num >= 1000
    ? `${(num / 1000).toFixed(1)}K`
    : num.toLocaleString();
};

export const StatsPanel = ({ totalData = 0, totalStats = {} }) => {
  const safeStats = totalStats || {};

  return (
    <div className="bg-white/90 rounded-lg shadow-md backdrop-blur-sm border border-gray-200 px-3 py-2.5">
      <div className="grid grid-cols-3 gap-3">

        {/* PAUD */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🟡 PAUD</div>
          <div className="text-sm font-bold text-yellow-600">
            {formatK(safeStats.paud)}
          </div>
        </div>

        {/* SD */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🔴 SD</div>
          <div className="text-sm font-bold text-orange-600">
            {formatK(safeStats.sd)}
          </div>
        </div>

        {/* SMP */}
        <div className="text-center">
          <div className="text-xs text-gray-600 mb-1">🔵 SMP</div>
          <div className="text-sm font-bold text-blue-600">
            {formatK(safeStats.smp)}
          </div>
        </div>
      </div>
    </div>
  );
};