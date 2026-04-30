import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Map as MapIcon, BarChart3, LayoutDashboard } from 'lucide-react';
import PetaMap from './components/PetaMap';

const SidebarItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link to={to} className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isActive ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
      <Icon size={20}/>
      <span className="font-medium">{label}</span>
    </Link>
  );
};

function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen bg-gray-900 overflow-hidden font-sans">
        
        <div className="w-64 bg-black p-5 flex flex-col gap-8 border-r border-gray-800">
          <div className="flex items-center gap-3 px-2 text-blue-500">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <LayoutDashboard size={24}/>
            </div>
            <span className="text-xl font-bold text-white tracking-tight">PPDB DASHBOARD</span>
          </div>
          
          <nav className="flex flex-col gap-2">
            <SidebarItem to="/" icon={MapIcon} label="Geografi"/>
            <SidebarItem to="/grafik" icon={BarChart3} label="Grafik"/>
          </nav>

          <div className="mt-auto p-4 bg-gray-900/50 rounded-xl border border-gray-800">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Data Status</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-gray-300">Live Parquet</p>
            </div>
          </div>
        </div>

        
        <div className="flex-1 relative bg-white">
          <Routes>
            <Route path="/" element={<PetaMap/>} />
            <Route path="/grafik" element={<div className="flex h-full items-center justify-center text-gray-400">Halaman Grafik (Coming Soon)</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;