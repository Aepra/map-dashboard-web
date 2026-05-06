
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MapPin, Users, FileText, Shirt, Heart } from 'lucide-react';
import Geospatial from './pages/Geospatial';
import Demografi from './pages/Demografi';
import Registrasi from './pages/Registrasi';
import SeragamGratis from './pages/SeragamGratis';
import BerkebutuhanKhusus from './pages/BerkebutuhanKhusus';
import EmbedItem from './components/EmbedItem';

function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';

  const dashboards = [
    {
      title: 'Geospatial',
      description: 'Peta peserta berdasarkan lokasi geografis',
      path: '/geospatial',
      embedUrl: `${baseUrl}/geospatial`,
      icon: MapPin,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      accentColor: 'text-blue-600',
    },
    {
      title: 'Demografi',
      description: 'Data demografis peserta SPMB',
      path: '/demografi',
      embedUrl: `${baseUrl}/demografi`,
      icon: Users,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      accentColor: 'text-green-600',
    },
    {
      title: 'Registrasi',
      description: 'Data pendaftaran peserta',
      path: '/registrasi',
      embedUrl: `${baseUrl}/registrasi`,
      icon: FileText,
      color: 'from-red-500 to-red-600',
      lightColor: 'bg-red-50',
      accentColor: 'text-red-600',
    },
    {
      title: 'Seragam Gratis',
      description: 'Program pemberian seragam',
      path: '/seragam',
      embedUrl: `${baseUrl}/seragam`,
      icon: Shirt,
      color: 'from-amber-500 to-amber-600',
      lightColor: 'bg-amber-50',
      accentColor: 'text-amber-600',
    },
    {
      title: 'Berkebutuhan Khusus',
      description: 'Data peserta dengan kebutuhan khusus',
      path: '/berkebutuhan',
      embedUrl: `${baseUrl}/berkebutuhan`,
      icon: Heart,
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-50',
      accentColor: 'text-purple-600',
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {/* Header */}
          <div className="mb-16">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              SPMB Dashboards
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Klik untuk buka dashboard, atau salin URL untuk embed ke website Anda
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {dashboards.map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <EmbedItem
                  key={dashboard.path}
                  title={dashboard.title}
                  description={dashboard.description}
                  path={dashboard.path}
                  embedUrl={dashboard.embedUrl}
                  icon={Icon}
                  color={dashboard.color}
                  lightColor={dashboard.lightColor}
                  accentColor={dashboard.accentColor}
                />
              );
            })}
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-gray-200/50">
            <p className="text-sm text-gray-500">
              SPMB Dashboard · Powered by Map System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppContent({ restartToken, handleRestartPage }) {
  return (
    <div className="flex flex-col h-screen w-screen font-sans bg-gradient-to-br from-gray-50 via-white to-gray-50">
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