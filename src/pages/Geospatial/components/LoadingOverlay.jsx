import React from 'react';

/**
 * Loading Overlay - ditampilkan saat DuckDB sedang process data
 */
export const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
          <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">Memproses Data...</p>
          <p className="text-sm text-gray-600 mt-2">Mengunduh & parsing 83.416 data pendaftaran</p>
        </div>
      </div>
    </div>
  );
};
