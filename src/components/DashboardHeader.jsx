import React from 'react';

const buttonStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid #fecaca',
  background: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)',
  color: '#991b1b',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
};

export const DashboardHeader = ({ title, onRestart }) => {
  return (
    <div
      style={{
        padding: '12px 16px',
        background: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}
    >
      <h1
        style={{
          fontSize: '18px',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0,
        }}
      >
        {title}
      </h1>

      <button type="button" onClick={onRestart} style={buttonStyle}>
        Restart
      </button>
    </div>
  );
};

export default DashboardHeader;