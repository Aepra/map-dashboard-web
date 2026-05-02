import React from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardLoadingOverlay from '../../components/DashboardLoadingOverlay';
import { useEffect, useState } from 'react';

export const Registrasi = ({ restartKey = 0, onRestart = () => {} }) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    setIframeLoading(true);
  }, [restartKey]);

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f9fafb'
      }}
    >
      <DashboardHeader title="Dashboard Registrasi SPMB 2025" onRestart={onRestart} />

      {/* Scroll container */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          position: 'relative'
        }}
      >
        {iframeLoading && (
          <DashboardLoadingOverlay
            title="Memuat Dashboard Registrasi"
            message="Sedang menyiapkan tampilan registrasi..."
            fullScreen={false}
          />
        )}
        {/* Konten */}
        <div
          style={{
            minHeight: '100%'
          }}
        >
          <iframe
            key={restartKey}
            src="https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_51xqv9f82d?nav=hidden"
            frameBorder="0"
            allowFullScreen
            onLoad={() => setIframeLoading(false)}
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{
              width: '100%',
              height: '200vh',
              border: 'none',
              display: 'block'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Registrasi;