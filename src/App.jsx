
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Registrasi from './pages/Registrasi';
import Demografi from './pages/Demografi';
import Geospatial from './pages/Geospatial';
import BerkebutuhanKhusus from './pages/BerkebutuhanKhusus';
import SeragamGratis from './pages/SeragamGratis';

function App() {
  const [activePage, setActivePage] = useState('registrasi');
  const [restartTokens, setRestartTokens] = useState({
    registrasi: 0,
    demografi: 0,
    geospatial: 0,
    kebutuhan: 0,
    seragam: 0,
  });

  // Navigation handler for sidebar
  const handleNavigate = (pageKey) => {
    setActivePage(pageKey);
  };

  const handleRestartPage = (pageKey) => {
    setRestartTokens((currentTokens) => ({
      ...currentTokens,
      [pageKey]: currentTokens[pageKey] + 1,
    }));
  };

  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      {/* Global Navigation Sidebar */}
      <Sidebar
        activePage={activePage}
        onNavigate={handleNavigate}
      />

      {/* Main Content Area */}
      <div
        className="relative bg-white overflow-auto"
        style={{
          minWidth: 0,
          flex: '1 1 0%',
        }}
      >
        {/* Render all pages, only show the active one */}
        <div style={{ display: activePage === 'registrasi' ? 'block' : 'none', height: '100%' }}>
          <Registrasi restartKey={restartTokens.registrasi} onRestart={() => handleRestartPage('registrasi')} />
        </div>
        <div style={{ display: activePage === 'demografi' ? 'block' : 'none', height: '100%' }}>
          <Demografi restartKey={restartTokens.demografi} onRestart={() => handleRestartPage('demografi')} />
        </div>
        <div style={{ display: activePage === 'geospatial' ? 'block' : 'none', height: '100%' }}>
          <Geospatial restartKey={restartTokens.geospatial} onRestart={() => handleRestartPage('geospatial')} />
        </div>
        <div style={{ display: activePage === 'kebutuhan' ? 'block' : 'none', height: '100%' }}>
          <BerkebutuhanKhusus restartKey={restartTokens.kebutuhan} onRestart={() => handleRestartPage('kebutuhan')} />
        </div>
        <div style={{ display: activePage === 'seragam' ? 'block' : 'none', height: '100%' }}>
          <SeragamGratis restartKey={restartTokens.seragam} onRestart={() => handleRestartPage('seragam')} />
        </div>
      </div>
    </div>
  );
}

export default App;