import GeospatialMap from './components/GeospatialMap';

export const Geospatial = ({ year, restartKey = 0, onRestart = () => {} }) => {
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
      <div style={{ flex: 1, minHeight: 0 }}>
        <GeospatialMap year={year} key={restartKey} onRestart={onRestart} />
      </div>
    </div>
  );
};

export default Geospatial;
