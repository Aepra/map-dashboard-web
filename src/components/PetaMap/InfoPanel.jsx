import React from 'react';

/**
 * Info Panel - Minimalist Title
 */
export const InfoPanel = () => {
  return (
    <div className="absolute top-4 right-4 z-40 pointer-events-none text-center">
      <h1 className="text-xl font-bold text-gray-800">🗺️ PPDB Makassar</h1>
      <p className="text-xs text-gray-500 mt-1">83.416 pendaftaran</p>
    </div>
  );
};
