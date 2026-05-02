
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Registrasi from './pages/Registrasi';
import Demografi from './pages/Demografi';
import Geospatial from './pages/Geospatial';
import BerkebutuhanKhusus from './pages/BerkebutuhanKhusus';
import SeragamGratis from './pages/SeragamGratis';


const PAGE_KEYS = [
  'registrasi',
  'demografi',
  'geospatial',
  'kebutuhan',
  'seragam',
];

function App() {
  const [activePage, setActivePage] = useState('registrasi');

  // Navigation handler for sidebar
  const handleNavigate = (pageKey) => {
    setActivePage(pageKey);
  };

  return (
    <div className="flex h-screen w-screen bg-gray-900 overflow-hidden font-sans">
      {/* Global Navigation Sidebar */}
      <Sidebar activePage={activePage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 relative bg-white overflow-auto">
        {/* Render all pages, only show the active one */}
        <div style={{ display: activePage === 'registrasi' ? 'block' : 'none', height: '100%' }}>
          <Registrasi />
        </div>
        <div style={{ display: activePage === 'demografi' ? 'block' : 'none', height: '100%' }}>
          <Demografi />
        </div>
        <div style={{ display: activePage === 'geospatial' ? 'block' : 'none', height: '100%' }}>
          <Geospatial />
        </div>
        <div style={{ display: activePage === 'kebutuhan' ? 'block' : 'none', height: '100%' }}>
          <BerkebutuhanKhusus />
        </div>
        <div style={{ display: activePage === 'seragam' ? 'block' : 'none', height: '100%' }}>
          <SeragamGratis />
        </div>
      </div>
    </div>
  );
}

export default App;