import { useEffect, useState } from 'react';
import DashboardLoadingOverlay from '../../components/DashboardLoadingOverlay';
import FloatingRestartButton from '../../components/FloatingRestartButton';

export const Smp = ({ restartKey = 0, onRestart = () => {} }) => {
  const [iframeLoading, setIframeLoading] = useState(true);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIframeLoading(true), 0);
    return () => clearTimeout(loadingTimer);
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
      <FloatingRestartButton onRestart={onRestart} />
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
            title="Memuat Dashboard Smp"
            message="Sedang menyiapkan tampilan dashboard..."
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
            src="https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_hupuqgi03d"
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

export default Smp;