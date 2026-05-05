"use client";

import DashboardLoadingOverlay from '../../components/DashboardLoadingOverlay';
import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { isEmbedAllowed } from '../../config/embedConfig';

export const Registrasi = ({ restartKey = 0, onRestart = () => {} }) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeSrc, setIframeSrc] = useState('');

  useEffect(() => {
    setIframeLoading(true);
    // Only set iframe src when embedding is allowed (by origin or referrer)
    if (isEmbedAllowed()) {
      setIframeSrc('https://datastudio.google.com/embed/reporting/618aa6b8-9cec-4fee-9950-80852e6c5d4f/page/p_51xqv9f82d');
    } else {
      // not allowed to embed here
      setIframeSrc('');
      setIframeLoading(false);
    }
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
          {iframeSrc ? (
            <iframe
              key={restartKey}
              src={iframeSrc}
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
          ) : (
            <div style={{ padding: 28, textAlign: 'center', color: '#64748b' }}>
              Embed hanya diizinkan pada domain superapps.makassarkota.go.id
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRestart}
        aria-label="Reload halaman"
        title="Reload"
        style={{
          position: 'fixed',
          right: '20px',
          top: '20px',
          width: '48px',
          height: '48px',
          borderRadius: '999px',
          border: '1px solid #cbd5e1',
          background: '#ffffff',
          color: '#1e293b',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 8px 20px rgba(2, 6, 23, 0.15)'
        }}
      >
        <RotateCcw size={18} />
      </button>
    </div>
  );
};

export default Registrasi;