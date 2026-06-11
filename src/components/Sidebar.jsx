import LogoIcon from '../assets/images/ICON_SPMB.svg';
import registrasiIconDark from '../assets/icons/registrasi_icon_dark.svg';
import registrasiIconLight from '../assets/icons/registrasi_icon_light.svg';
import demografiIconDark from '../assets/icons/demografi_icon_dark.svg';
import demografiIconLight from '../assets/icons/demografi_icon_light.svg';
import geospatialIconDark from '../assets/icons/geospatial_icon_dark.svg';
import geospatialIconLight from '../assets/icons/geospatial_icon_light.svg';
import berkebIconDark from '../assets/icons/berkebutuhankhusus_icon_dark.svg';
import berkebIconLight from '../assets/icons/berkebutuhankhusus_icon_light.svg';
import seragamIconDark from '../assets/icons/seragamgratis_Dark.svg';
import seragamIconLight from '../assets/icons/seragamgratis_light.svg';
import pendaftaranAkunIconDark from '../assets/icons/pendaftaran_akun_dark.svg';
import pendaftaranAkunIconLight from '../assets/icons/pendaftaran_akun_light.svg';
import outlierIconDark from '../assets/icons/outlier_dark.svg';
import outlierIconLight from '../assets/icons/outlier_light.svg';

/**
 * Global Navigation Sidebar
 * Universal menu container for all pages in th e app
 */
const Sidebar = ({
  activePage = 'geospatial',
  onNavigate = () => {},
}) => {
  const getIcon = (page, darkIcon, lightIcon) => (activePage === page ? lightIcon : darkIcon);

  return (
    <aside
      className="flex-none bg-white border-r border-gray-200 h-full flex flex-col z-40"
      style={{
        position: 'relative',
        overflow: 'visible',
        width: '270px',
      }}
    >
      {/* Header/Logo */}
      <div className="px-4 py-5">
        <div className="flex items-start gap-3">
          <img src={LogoIcon} alt="Logo" className="w-11 h-11 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-helvetica font-bold text-base text-gray-900">Dashboard Monitoring</div>
            <div className="text-helvetica font-bold text-sm text-gray-900 leading-snug">SPMB Disdik Makassar</div>
            <div className="text-helvetica text-xs text-gray-700 font-normal mt-0.5">2026</div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-0 flex flex-col px-3 py-3 gap-3">
        <button
          onClick={() => onNavigate('registrasi')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'registrasi'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'registrasi' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('registrasi', registrasiIconDark, registrasiIconLight)} alt="Registrasi" className="w-6 h-6" />
          <span>Registrasi</span>
        </button>

        <button
          onClick={() => onNavigate('demografi')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'demografi'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'demografi' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('demografi', demografiIconDark, demografiIconLight)} alt="Demografi" className="w-6 h-6" />
          <span>Demografi</span>
        </button>

        <button
          onClick={() => onNavigate('geospatial')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'geospatial'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'geospatial' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('geospatial', geospatialIconDark, geospatialIconLight)} alt="Geospatial" className="w-6 h-6" />
          <span>Geospatial</span>
        </button>

        <button
          onClick={() => onNavigate('kebutuhan')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'kebutuhan'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'kebutuhan' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('kebutuhan', berkebIconDark, berkebIconLight)} alt="Berkebutuhan Khusus" className="w-5 h-5" />
          <span>Berkebutuhan Khusus</span>
        </button>

        <button
          onClick={() => onNavigate('seragam')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'seragam'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'seragam' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('seragam', seragamIconDark, seragamIconLight)} alt="Seragam Gratis" className="w-6 h-6" />
          <span>Seragam Gratis</span>
        </button>

        <button
          onClick={() => onNavigate('pendaftaran_akun')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'pendaftaran_akun'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'pendaftaran_akun' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('pendaftaran_akun', pendaftaranAkunIconDark, pendaftaranAkunIconLight)} alt="Pendaftaran Akun" className="w-6 h-6" />
          <span>Pendaftaran Akun</span>
        </button>

        <button
          onClick={() => onNavigate('outlier')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-helvetica transition-all ${
            activePage === 'outlier'
              ? 'text-white font-semibold'
              : 'text-gray-600 font-normal hover:text-gray-700'
          }`}
          style={activePage === 'outlier' ? { backgroundColor: 'rgb(182, 32, 37)' } : {}}
        >
          <img src={getIcon('outlier', outlierIconDark, outlierIconLight)} alt="Outlier" className="w-6 h-6" />
          <span>Outlier</span>
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;