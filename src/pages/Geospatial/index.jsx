// Geospatial page - Main map dashboard
import React from 'react';
import GeospatialMap from './components/GeospatialMap';
import DashboardHeader from '../../components/DashboardHeader';

export const Geospatial = ({ restartKey = 0, onRestart = () => {} }) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f9fafb',
      }}
    >
      <DashboardHeader title="Dashboard Geospatial" onRestart={onRestart} />
      <div style={{ flex: 1, minHeight: 0 }}>
        <GeospatialMap key={restartKey} />
      </div>
    </div>
  );
};

export default Geospatial;
