import React from 'react';

export const DashboardLoadingOverlay = ({ title = 'Memuat Dashboard', message = 'Mohon tunggu sebentar...', fullScreen = true }) => {
  return (
    <div className={`${fullScreen ? 'fixed' : 'absolute'} inset-0 z-50 flex items-center justify-center bg-white/88 backdrop-blur-sm`}>
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-lg">
        <div className="flex gap-2">
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-600" style={{ animationDelay: '0s' }} />
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-600" style={{ animationDelay: '0.15s' }} />
          <div className="h-3 w-3 animate-bounce rounded-full bg-red-600" style={{ animationDelay: '0.3s' }} />
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardLoadingOverlay;