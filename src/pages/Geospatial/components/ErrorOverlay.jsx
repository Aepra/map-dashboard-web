import React from 'react';

/**
 * Error Overlay - ditampilkan saat terjadi error saat loading data
 */
export const ErrorOverlay = ({ error }) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-50/90">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
        <div className="text-red-600 font-bold text-lg mb-2">❌ Error</div>
        <p className="text-gray-700 mb-4 text-sm">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
        >
          Reload Halaman
        </button>
      </div>
    </div>
  );
};
