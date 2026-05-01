import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PetaMap from './components/PetaMap';

function App() {
  return (
    <Router>
      <div className="flex h-screen w-screen bg-gray-900 overflow-hidden font-sans">
        
        {/* Left nav removed: replaced by in-map sidebar in PetaMap (per design) */}

        
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