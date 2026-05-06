import { useState } from 'react';

export const FloatingRestartButton = ({ onRestart = () => {} }) => {
  const [spinKey, setSpinKey] = useState(0);

  const handleClick = () => {
    setSpinKey(prev => prev + 1);
    if (onRestart) onRestart();
  };

  return (
    <>
      <style>{`
        @keyframes floating-restart-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
      
      <button
        onClick={handleClick}
        className="fixed bottom-6 left-6 z-50 group"
        style={{
          padding: '12px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.08)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.04)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <svg
          key={spinKey}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            color: '#666',
            animation: 'floating-restart-spin 0.6s linear',
          }}
        >
          <path d="M1 4v6h6M19 16v-6h-6" />
          <path d="M4 13a8 8 0 0 0 13.956-3.856M16 7a8 8 0 0 0-13.956 3.856" />
        </svg>
      </button>
    </>
  );
};

export default FloatingRestartButton;
