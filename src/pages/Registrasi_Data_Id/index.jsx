import { useEffect, useState } from 'react';
import DashboardLoadingOverlay from '../../components/DashboardLoadingOverlay';
import FloatingRestartButton from '../../components/FloatingRestartButton';
import { getUrlForTypeAndYear } from '../../utils/envConfig';

export const Registrasi_Data_Id = ({ year, restartKey = 0, onRestart = () => {} }) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const embedUrl = getUrlForTypeAndYear('BERANDA', year);

  useEffect(() => {
    const loadingTimer = setTimeout(() => setIframeLoading(true), 0);
    return () => clearTimeout(loadingTimer);
  }, [restartKey, year]);

  if (!embedUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 text-gray-800">
        <div className="p-8 bg-white rounded-xl shadow-sm border border-gray-200 text-center">
          <h2 className="text-2xl font-bold mb-4">Data Tidak Ditemukan</h2>
          <p>Konfigurasi URL Beranda untuk tahun {year} belum tersedia di file .env.</p>
        </div>
      </div>
    );
  }

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
            title={`Memuat Beranda (${year})`}
            message={`Sedang menyiapkan tampilan beranda tahun ${year}...`}
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
            key={`${restartKey}-${year}`}
            src={embedUrl}
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

export default Registrasi_Data_Id;