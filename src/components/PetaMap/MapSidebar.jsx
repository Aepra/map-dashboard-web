import React from 'react';

export const MapSidebar = ({
  jenjangChecks,
  onToggleJenjang,
  selectedStatus,
  onChangeStatus,
  selectedJalur,
  onChangeJalur,
  activePage = 'geospatial',
}) => {
  const activeButtonStyle = {
    backgroundColor: 'rgb(182, 32, 37)',
  };

  return (
    <aside className="w-62.5 flex-none bg-white border-r border-gray-200 h-full flex flex-col z-40" style={{position: 'relative'}}>
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-md flex items-center justify-center text-white font-bold" style={{backgroundColor: 'rgb(182, 32, 37)'}}>SP</div>
          <div>
            <div className="text-sm font-semibold">Dashboard Monitoring</div>
            <div className="text-xs text-gray-500">SPMB Disdik Makassar</div>
          </div>
        </div>
      </div>

      <nav className="flex-0 flex flex-col px-2 py-1 gap-1">
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activePage === 'registrasi' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`} style={activePage==='registrasi' ? activeButtonStyle : {}}>
          <span className="ml-1">Registrasi</span>
        </button>
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activePage === 'demografi' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`} style={activePage==='demografi' ? activeButtonStyle : {}}>
          <span className="ml-1">Demografi</span>
        </button>
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activePage === 'geospatial' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`} style={activePage==='geospatial' ? activeButtonStyle : {}}>
          <span className="ml-1">Geospatial</span>
        </button>
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activePage === 'kebutuhan' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`} style={activePage==='kebutuhan' ? activeButtonStyle : {}}>
          <span className="ml-1">Berkebutuhan Khusus</span>
        </button>
        <button className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activePage === 'seragam' ? 'text-white' : 'text-gray-700 hover:bg-gray-50'}`} style={activePage==='seragam' ? activeButtonStyle : {}}>
          <span className="ml-1">Seragam Gratis</span>
        </button>
      </nav>

    </aside>
  );
};

export default MapSidebar;
