import LogoIcon from '../assets/images/LogoColor.png';
import registrasiIcon from '../assets/icons/registrasi_icon.png';
import demografiIcon from '../assets/icons/demografi_icon.png';
import geospatialIcon from '../assets/icons/geospatial_icon.png';
import berkebIcon from '../assets/icons/berkebutuhankhusus_icon.png';
import sergraIcon from '../assets/icons/seragamgratis_icon.png';

/**
 * Global Navigation Sidebar
 * Universal menu container for all pages in th e app
 */
const Sidebar = ({
  activePage = 'geospatial',
  onNavigate = () => {},
}) => {
  const activeButtonStyle = {
    backgroundColor: 'rgb(182, 32, 37)',
  };

  return (
    <aside
      className="flex-none bg-white border-r border-gray-200 h-full flex flex-col z-40"
      style={{
        position: 'relative',
        overflow: 'visible',
        width: '250px',
      }}
    >
      {/* Header/Logo */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <img src={LogoIcon} alt="Logo" className="w-10 h-10" />
          <div>
            <div className="text-sm font-semibold">Dashboard Monitoring</div>
            <div className="text-sm font-semibold">SPMB Disdik Makassar</div>
            <div className="text-xs text-gray-500">2025</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-0 flex flex-col px-2 py-1 gap-1">
        <button
          onClick={() => onNavigate('registrasi')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${activePage === 'registrasi' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          style={activePage === 'registrasi' ? activeButtonStyle : {}}
        >
          <img src={registrasiIcon} alt="Registrasi" className="w-5 h-5" />
          <span className="ml-1">Registrasi</span>
        </button>

        <button
          onClick={() => onNavigate('demografi')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${activePage === 'demografi' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          style={activePage === 'demografi' ? activeButtonStyle : {}}
        >
          <img src={demografiIcon} alt="Demografi" className="w-5 h-5" />
          <span className="ml-1">Demografi</span>
        </button>

        <button
          onClick={() => onNavigate('geospatial')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${activePage === 'geospatial' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          style={activePage === 'geospatial' ? activeButtonStyle : {}}
        >
          <img src={geospatialIcon} alt="Geospatial" className="w-5 h-5" />
          <span className="ml-1">Geospatial</span>
        </button>

        <button
          onClick={() => onNavigate('kebutuhan')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${activePage === 'kebutuhan' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          style={activePage === 'kebutuhan' ? activeButtonStyle : {}}
        >
          <img src={berkebIcon} alt="Berkebutuhan Khusus" className="w-5 h-5" />
          <span className="ml-1">Berkebutuhan Khusus</span>
        </button>

        <button
          onClick={() => onNavigate('seragam')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${activePage === 'seragam' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`}
          style={activePage === 'seragam' ? activeButtonStyle : {}}
        >
          <img src={sergraIcon} alt="Seragam Gratis" className="w-5 h-5" />
          <span className="ml-1">Seragam Gratis</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
