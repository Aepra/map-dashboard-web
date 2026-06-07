
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { MapPin, Users, FileText, Heart } from 'lucide-react';
import Geospatial from './pages/Geospatial';
import Beranda from './pages/Beranda';
import Paud from './pages/Paud';
import Sd from './pages/Sd';
import Smp from './pages/Smp';
import EmbedItem from './components/EmbedItem';
import { getAvailableYears, getDashboardsConfig } from './utils/envConfig';

function Home() {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com';
  const years = getAvailableYears();
  const config = getDashboardsConfig();

  const baseDashboards = [
    {
      id: 'geospatial',
      title: 'Geospatial',
      description: 'Peta peserta berdasarkan lokasi geografis',
      icon: MapPin,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-50',
      accentColor: 'text-blue-600',
    },
    {
      id: 'beranda',
      title: 'Beranda',
      description: 'Beranda peserta SPMB',
      icon: Users,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      accentColor: 'text-green-600',
    },
    {
      id: 'paud',
      title: 'PAUD',
      description: 'Data peserta PAUD',
      icon: FileText,
      color: 'from-red-500 to-red-600',
      lightColor: 'bg-red-50',
      accentColor: 'text-red-600',
    },
    {
      id: 'sd',
      title: 'SD',
      description: 'Data peserta SD',
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-amber-50',
      accentColor: 'text-amber-600',
    },
    {
      id: 'smp',
      title: 'SMP',
      description: 'Data peserta SMP',
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
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              SPMB Dashboards
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Klik untuk buka dashboard, atau salin URL untuk embed ke website Anda
            </p>
          </div>

          {/* Vertical List */}
          <div className="flex flex-col gap-6 mb-12">
            {years.length === 0 ? (
              <div className="p-6 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-200">
                Belum ada konfigurasi tahun di file .env. Silakan tambahkan variabel seperti VITE_BERANDA_2025=...
              </div>
            ) : (
              years.map((year) => (
                <div key={year} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Data Tahun {year}</h2>
                  <div className="flex flex-col gap-4">
                    {baseDashboards.map((dashboard) => {
                      // Check if the URL exists for this year
                      if (!config[year][dashboard.id]) return null;

                      const Icon = dashboard.icon;
                      const path = `/${dashboard.id}/${year}`;
                      
                      return (
                        <EmbedItem
                          key={`${dashboard.id}-${year}`}
                          title={`${dashboard.title} (${year})`}
                          description={dashboard.description}
                          path={path}
                          embedUrl={`${baseUrl}${path}`}
                          icon={Icon}
                          color={dashboard.color}
                          lightColor={dashboard.lightColor}
                          accentColor={dashboard.accentColor}
                        />
                      );
                    })}
                  </div>
                </div>
              ))
            )}
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

// Wrapper components to pass year from URL to the page components
function GeospatialWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Geospatial year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function BerandaWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Beranda year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function PaudWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Paud year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function SdWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Sd year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function SmpWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Smp year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function AppContent({ restartToken, handleRestartPage }) {
  return (
    <div className="flex flex-col h-screen w-screen font-sans bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <main className="flex-1 bg-white overflow-hidden">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/geospatial/:year"
            element={<GeospatialWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/beranda/:year"
            element={<BerandaWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/paud/:year"
            element={<PaudWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/sd/:year"
            element={<SdWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/smp/:year"
            element={<SmpWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
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