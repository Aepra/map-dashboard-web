import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { Users, FileText, Heart, UserCircle, Map, UserPlus, AlertTriangle } from 'lucide-react';
import Geospatial from './pages/Geospatial';
import Registrasi_Data_Id from './pages/Registrasi_Data_Id';
import Registrasi_Data_Nik from './pages/Registrasi_Data_Nik';
import Tk from './pages/Tk';
import Sd from './pages/Sd';
import Smp from './pages/Smp';
import Pendaftaran_Akun from './pages/Pendaftaran_Akun';
import Outlier from './pages/Outlier';
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
      description: 'Peta sebaran data murid',
      icon: Map,
      color: 'from-blue-500 to-indigo-600',
      lightColor: 'bg-blue-50',
      accentColor: 'text-blue-600',
    },
    {
      id: 'Registrasi_Data_Id',
      title: 'Registrasi Data ID',
      description: 'Registrasi data ID peserta SPMB',
      icon: Users,
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-50',
      accentColor: 'text-green-600',
    },
    {
      id: 'Registrasi_Data_Nik',
      title: 'Registrasi Data NIK',
      description: 'Registrasi data NIK peserta SPMB',
      icon: UserCircle,
      color: 'from-teal-500 to-teal-600',
      lightColor: 'bg-teal-50',
      accentColor: 'text-teal-600',
    },
    {
      id: 'tk',
      title: 'TK',
      description: 'Data peserta TK',
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
    {
      id: 'pendaftaran_akun',
      title: 'Pendaftaran Akun',
      description: 'Data pendaftaran akun peserta SPMB',
      icon: UserPlus,
      color: 'from-cyan-500 to-cyan-600',
      lightColor: 'bg-cyan-50',
      accentColor: 'text-cyan-600',
    },
    {
      id: 'outlier',
      title: 'Outlier',
      description: 'Data outlier peserta SPMB',
      icon: AlertTriangle,
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-50',
      accentColor: 'text-orange-600',
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
                Belum ada konfigurasi tahun di file .env. Silakan tambahkan variabel seperti VITE_REGISTRASI_DATA_ID_2025=...
              </div>
            ) : (
              years.map((year) => (
                <div key={year} className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Data Tahun {year}</h2>
                  <div className="flex flex-col gap-4">
                    {baseDashboards.map((dashboard) => {
                      // Check if the URL exists for this year
                      const configKey = dashboard.id.toLowerCase();
                      if (!config[year][configKey]) return null;

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
          <div className="pt-8 border-t border-gray-200/50 flex flex-col items-center gap-2 text-sm text-gray-500">
            <p>
              Developed by <strong>Abel Eka Putra</strong>
            </p>
            <p>
              Sistem Informasi · Universitas Hasanuddin
            </p>
            <a 
              href="https://github.com/Aepra" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub Profile
            </a>
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

function Registrasi_Data_IdWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Registrasi_Data_Id year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function Registrasi_Data_NikWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Registrasi_Data_Nik year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function TkWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Tk year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function SdWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Sd year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function SmpWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Smp year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function Pendaftaran_AkunWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Pendaftaran_Akun year={year} restartKey={restartKey} onRestart={onRestart} />;
}

function OutlierWrapper({ restartKey, onRestart }) {
  const { year } = useParams();
  return <Outlier year={year} restartKey={restartKey} onRestart={onRestart} />;
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
            path="/Registrasi_Data_Id/:year"
            element={<Registrasi_Data_IdWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/Registrasi_Data_Nik/:year"
            element={<Registrasi_Data_NikWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/tk/:year"
            element={<TkWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/sd/:year"
            element={<SdWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/smp/:year"
            element={<SmpWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/pendaftaran_akun/:year"
            element={<Pendaftaran_AkunWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
          />
          <Route
            path="/outlier/:year"
            element={<OutlierWrapper restartKey={restartToken} onRestart={handleRestartPage} />}
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
