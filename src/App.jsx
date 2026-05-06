
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Geospatial from './pages/Geospatial';
import Demografi from './pages/Demografi';
import Registrasi from './pages/Registrasi';
import SeragamGratis from './pages/SeragamGratis';
import BerkebutuhanKhusus from './pages/BerkebutuhanKhusus';

function Home() {
  const cards = [
    { to: '/geospatial', title: 'Geospatial' },
    { to: '/demografi', title: 'Demografi' },
    { to: '/registrasi', title: 'Registrasi' },
    { to: '/seragam', title: 'Seragam Gratis' },
    { to: '/berkebutuhan', title: 'Berkebutuhan Khusus' }
  ];

  return (
    <div className="p-8 w-full h-full overflow-auto bg-gray-50">
      <h1 className="text-2xl font-semibold mb-4">Dashboard Utama</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <NavLink
            to={c.to}
            key={c.to}
            className="block p-6 bg-white rounded shadow hover:shadow-md transition text-center"
          >
            <div className="text-lg font-medium">{c.title}</div>
          </NavLink>
        ))}
      </div>
    </div>
  );
}

function AppContent({ restartToken, handleRestartPage }) {
  const location = useLocation();

  const hideOn = ['/geospatial', '/demografi', '/registrasi', '/seragam', '/berkebutuhan'];
  const hideHeader = hideOn.some((p) => location.pathname.startsWith(p));

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`;

  return (
    <div className="flex flex-col h-screen w-screen font-sans">
      {!hideHeader && (
        <header className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="text-lg font-semibold">SPMB Dashboard</div>
            <nav className="flex gap-2">
              <NavLink to="/" className={linkClass} end>
                Home
              </NavLink>
              <NavLink to="/geospatial" className={linkClass}>
                Geospatial
              </NavLink>
              <NavLink to="/demografi" className={linkClass}>
                Demografi
              </NavLink>
              <NavLink to="/registrasi" className={linkClass}>
                Registrasi
              </NavLink>
            </nav>
          </div>
        </header>
      )}

      <main className="flex-1 bg-white overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/geospatial"
            element={<Geospatial restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/demografi"
            element={<Demografi restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/registrasi"
            element={<Registrasi restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/seragam"
            element={<SeragamGratis restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/berkebutuhan"
            element={<BerkebutuhanKhusus restartKey={restartToken} onRestart={handleRestartPage} />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [restartToken, setRestartToken] = useState(0);

  const handleRestartPage = () => setRestartToken((t) => t + 1);

  return (
    <Router>
      <AppContent restartToken={restartToken} handleRestartPage={handleRestartPage} />
    </Router>
  );
}

export default App;