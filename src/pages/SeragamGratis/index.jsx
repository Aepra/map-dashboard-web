import React from 'react';
import { useEffect, useState } from 'react';
import DashboardHeader from '../../components/DashboardHeader';
import DashboardLoadingOverlay from '../../components/DashboardLoadingOverlay';

export const SeragamGratis = ({ restartKey = 0, onRestart = () => {} }) => {
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
      <DashboardHeader title="Dashboard Seragam Gratis" onRestart={onRestart} />

      {/* Scroll container (scrollbar kiri) */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          direction: 'rtl',
          position: 'relative'
        }}
      >
        {iframeLoading && (
          <DashboardLoadingOverlay
            title="Memuat Dashboard Seragam Gratis"
            message="Sedang menyiapkan tampilan seragam gratis..."
            fullScreen={false}
          />
        )}
        {/* Balikin konten ke normal */}
        <div
          style={{
            direction: 'ltr',
            minHeight: '100%'
          }}
        >
          <iframe
            key={restartKey}
            src="https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_dgfteen52d"
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

export default SeragamGratis;