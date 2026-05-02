import React from 'react';

export const Registrasi = () => {
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
      {/* Header */}
      <div
        style={{
          padding: '12px 16px',
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb'
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 600,
            color: '#1f2937',
            margin: 0
          }}
        >
          Dashboard Registrasi SPMB 2025
        </h1>
      </div>

      {/* Scroll container (scrollbar kiri) */}
      <div
        style={{
          flexGrow: 1,
          overflowY: 'auto',
          direction: 'rtl'
        }}
      >
        {/* Balikin konten ke normal */}
        <div
          style={{
            direction: 'ltr',
            minHeight: '100%'
          }}
        >
          <iframe
            src="https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_51xqv9f82d?nav=hidden"
            frameBorder="0"
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
            style={{
              width: '100%',
              height: '200vh', // bikin bisa discroll
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