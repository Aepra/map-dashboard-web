/**
 * Loading Overlay - ditampilkan saat DuckDB sedang process data
 */
export const LoadingOverlay = () => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/88 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-8 py-6 shadow-lg">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'rgb(182, 32, 37)', animationDelay: '0s' }} />
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'rgb(182, 32, 37)', animationDelay: '0.2s' }} />
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: 'rgb(182, 32, 37)', animationDelay: '0.4s' }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">Memuat Dashboard Geospatial</p>
          <p className="text-sm text-gray-600 mt-1">Sedang menyiapkan tampilan geospatial...</p>
        </div>
      </div>
    </div>
  );
};
