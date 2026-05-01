import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import DeckGL from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { Map as MapView } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Hooks & Utilities
import { useDuckDBData } from './PetaMap/useDuckDBData';
import { useFilteredData } from './PetaMap/useFilteredData';
import { createSchoolLayer, createStudentLayer } from './PetaMap/createLayer';
import MapSidebar from './PetaMap/MapSidebar';

// Components
import { LoadingOverlay } from './PetaMap/LoadingOverlay';
import { ErrorOverlay } from './PetaMap/ErrorOverlay';
import { StatsPanel } from './PetaMap/StatsPanel';

// Constants
import { DEFAULT_VIEW_STATE, MAP_STYLE } from './PetaMap/constants';

/**
 * PetaMap Component - Main Map Dashboard
 * Renders 83.416 student registration data with filtering & visualization
 */
const PetaMap = () => {
  // Data Loading
  const { data, loading, error } = useDuckDBData();

  // View State
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  // Filter State - Checkbox untuk jenjang
  const [checkedJenjang, setCheckedJenjang] = useState({
    SD: true,
    SMP: true,
    PAUD: true,
  });
  const [activeDropdown, setActiveDropdown] = useState(null);
  const filterBarRef = useRef(null);
  const [jenjangSearch, setJenjangSearch] = useState('');
  // Status filter now uses checkbox-style selection (diterima / tidak)
  const [checkedStatus, setCheckedStatus] = useState({ diterima: true, tidak: true });
  const [statusSearch, setStatusSearch] = useState('');
  const [vizMode] = useState('normal');
  const [selectedSchool, setSelectedSchool] = useState(null);
  

  const mapController = useMemo(
    () => ({
      dragPan: true,
      scrollZoom: { speed: 0.8, smooth: true },
      touchZoom: { speed: 0.8, smooth: true },
      doubleClickZoom: true,
      keyboard: true,
      inertia: 300,
    }),
    []
  );


  const zoomBucket = useMemo(() => Math.round(viewState.zoom * 2) / 2, [viewState.zoom]);

  // Compute counts for each jenjang
  const jenjangCounts = useMemo(() => {
    const counts = { SD: 0, SMP: 0, PAUD: 0 };
    data.forEach((r) => {
      if (r.jenjang) {
        if (r.jenjang.includes('SD')) counts.SD++;
        if (r.jenjang.includes('SMP')) counts.SMP++;
        if (r.jenjang.includes('PAUD')) counts.PAUD++;
      }
    });
    return counts;
  }, [data]);

  // Helper to format large numbers
  const formatCount = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + ' M';
    if (num >= 1000) return (num / 1000).toFixed(1) + ' K';
    return num.toString();
  };

  const allJenjangSelected = checkedJenjang.SD && checkedJenjang.SMP && checkedJenjang.PAUD;

  const statusCounts = useMemo(() => {
    const counts = { diterima: 0, tidak: 0 };
    data.forEach((r) => {
      const t = (r.status_penerimaan || '').toString().toLowerCase();
      if (t.includes('terima') || t.includes('lulus')) counts.diterima++;
      if (t.includes('tidak')) counts.tidak++;
    });
    return counts;
  }, [data]);

  const allStatusSelected = checkedStatus.diterima && checkedStatus.tidak;
  // derive available `jalur` values from data
  const jalurOptions = useMemo(() => {
    const s = new Set();
    data.forEach((r) => {
      const jalur = (r.jalur || '').trim();
      if (jalur) s.add(jalur);
    });
    return Array.from(s).filter(Boolean).sort();
  }, [data]);

  // initialize checkedJalur state from jalurOptions
  const initialCheckedJalur = useMemo(() => {
    const obj = {};
    jalurOptions.forEach((j) => {
      obj[j] = true;
    });
    return obj;
  }, [jalurOptions]);

  const [checkedJalur, setCheckedJalur] = useState(initialCheckedJalur);
  const [jalurSearch, setJalurSearch] = useState('');

  const jalurCounts = useMemo(() => {
    const counts = {};
    data.forEach((r) => {
      const jalur = (r.jalur || '').trim();
      if (jalur) counts[jalur] = (counts[jalur] || 0) + 1;
    });
    return counts;
  }, [data]);

  const allJalurSelected = jalurOptions.length > 0 && jalurOptions.every((j) => checkedJalur[j]);

  // initialize checkedJalur defaults when jalurOptions change
  useEffect(() => {
    if (!jalurOptions || jalurOptions.length === 0) return;
    // defer setState to avoid synchronous state update warning
    const t = setTimeout(() => {
      setCheckedJalur((prev) => {
        const next = { ...prev };
        jalurOptions.forEach((j) => {
          if (next[j] === undefined) next[j] = true;
        });
        // remove keys not present anymore
        Object.keys(next).forEach((k) => {
          if (!jalurOptions.includes(k)) delete next[k];
        });
        return next;
      });
    }, 0);
    return () => clearTimeout(t);
  }, [jalurOptions]);

  // Filtered Data - moved after checkedJalur initialization to avoid TDZ
  const filteredData = useFilteredData(
    data,
    checkedJenjang,
    checkedStatus,
    selectedSchool,
    checkedJalur
  );

  const filteredStats = useMemo(() => {
    const total = filteredData.length;
    const sd = filteredData.filter((r) => (r.jenjang || '').includes('SD')).length;
    const smp = filteredData.filter((r) => (r.jenjang || '').includes('SMP')).length;
    const paud = filteredData.filter(
      (r) => !(r.jenjang || '').includes('SD') && !(r.jenjang || '').includes('SMP')
    ).length;
    return { total, sd, smp, paud };
  }, [filteredData]);

  const schoolData = useMemo(() => {
    if (filteredData.length === 0) return [];
    const schoolMap = new Map();

    const getMedian = (values) => {
      if (!values.length) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
      return sorted[mid];
    };

    filteredData.forEach((row) => {
      const name = row.nama_sekolah_tujuan || 'N/A';
      if (!schoolMap.has(name)) {
        schoolMap.set(name, {
          nama: name,
          lintangList: [],
          bujurList: [],
          totalSiswa: 0,
        });
      }
      const entry = schoolMap.get(name);
      entry.lintangList.push(row.lintang);
      entry.bujurList.push(row.bujur);
      entry.totalSiswa += 1;
    });

    return Array.from(schoolMap.values()).map((entry) => ({
      nama: entry.nama,
      lintang: getMedian(entry.lintangList),
      bujur: getMedian(entry.bujurList),
      totalSiswa: entry.totalSiswa,
    }));
  }, [filteredData]);

  const handleSelectSchool = useCallback((schoolName) => {
    setSelectedSchool((prev) => (prev === schoolName ? null : schoolName));
  }, []);

  /**
   * Memoized Layers - recalculate hanya saat data/zoom/vizMode berubah
   */
  const layers = useMemo(
    () => {
      if (filteredData.length === 0) return [];
      return [
        createStudentLayer(filteredData, zoomBucket, vizMode),
        createSchoolLayer(schoolData, zoomBucket, handleSelectSchool),
      ];
    },
    [filteredData, schoolData, zoomBucket, vizMode, handleSelectSchool]
  );
  /**
   * Memoized Tooltip
   */
  const getTooltip = useCallback(({ object }) => {
    if (!object) return null;
    if (object.nama && !object.nama_sekolah_tujuan) {
      return {
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 8px; font-size: 12px;">
            <div style="font-weight: 600; color: #111827;">${object.nama}</div>
            <div style="margin-top: 4px; color: #6b7280; font-size: 11px;">${
              object.totalSiswa?.toLocaleString('id-ID') || '0'
            } siswa</div>
          </div>
        `,
        style: {
          backgroundColor: '#ffffff',
          borderRadius: '6px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          border: 'none',
        },
      };
    }
    return {
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 10px; max-width: 280px; font-size: 12px;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 6px;">${
            object.nama_sekolah_tujuan || 'N/A'
          }</div>
          <div style="border-bottom: 1px solid #e5e7eb; padding: 6px 0; font-size: 11px;">
            <div><strong>Jenjang:</strong> ${object.jenjang || 'N/A'}</div>
            <div><strong>Status:</strong> ${object.status_penerimaan || 'N/A'}</div>
            <div><strong>Id Peserta:</strong> ${object.id_peserta || 'N/A'}</div>
          </div>
        </div>
      `,
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '6px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: 'none',
      },
    };
  }, []);

  /**
   * Memoized View State Handler
   */
  const handleViewStateChange = useCallback((e) => {
    setViewState(e.viewState);
  }, []);

  const animateToViewState = useCallback((nextViewState) => {
    setViewState((prev) => ({
      ...prev,
      ...nextViewState,
      transitionDuration: 350,
      transitionInterpolator: new FlyToInterpolator(),
    }));
  }, []);

  const handleZoomOutMax = useCallback(() => {
    animateToViewState(DEFAULT_VIEW_STATE);
  }, [animateToViewState]);

  const handleZoomStep = useCallback((direction) => {
    animateToViewState({
      zoom: Math.max(1, Math.min(16, viewState.zoom + direction)),
      longitude: viewState.longitude,
      latitude: viewState.latitude,
    });
  }, [animateToViewState, viewState.latitude, viewState.longitude, viewState.zoom]);

  const toggleDropdown = useCallback((name) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!activeDropdown) return;
      if (filterBarRef.current && !filterBarRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [activeDropdown]);

  return (
    <div className="flex h-screen w-screen bg-gray-50">
      <MapSidebar
        jenjangChecks={checkedJenjang}
        onToggleJenjang={(key) => setCheckedJenjang((prev) => ({ ...prev, [key]: !prev[key] }))}
        activePage="geospatial"
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="h-20 flex-none border-b border-gray-200 bg-white/95 px-4 flex items-center">
          {!loading && !error && data.length > 0 && (
            <div ref={filterBarRef} className="flex items-center gap-4 pointer-events-auto w-full">
              {/* Jenjang Dropdown */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('jenjang')}
                  className="h-8 px-4 bg-white border border-gray-300 rounded-md text-[15px] text-gray-600 hover:bg-gray-50 focus:outline-none cursor-pointer font-normal flex items-center justify-between gap-3"
                  style={{minWidth: 180}}
                >
                  <span>Jenjang</span>
                  <svg
                    viewBox="0 0 10 6"
                    aria-hidden="true"
                    className="w-2.5 h-2.5 text-gray-500 shrink-0 ml-2"
                    fill="currentColor"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>

                {activeDropdown === 'jenjang' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg p-3 z-60">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (allJenjangSelected) {
                            setCheckedJenjang({ SD: false, SMP: false, PAUD: false });
                          } else {
                            setCheckedJenjang({ SD: true, SMP: true, PAUD: true });
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded border transition-colors"
                        style={{
                          borderColor: 'rgb(182, 32, 37)',
                          backgroundColor: allJenjangSelected ? 'rgb(182, 32, 37)' : 'transparent',
                        }}
                        aria-label={allJenjangSelected ? 'Batal semua jenjang' : 'Pilih semua jenjang'}
                      >
                        {allJenjangSelected && (
                          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                            <path d="M5 10.5L8.2 13.7L15 6.9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 text-sm font-semibold text-gray-700">Jenjang</div>
                    </div>

                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Ketik untuk menelusuri"
                        value={jenjangSearch}
                        onChange={(e) => setJenjangSearch(e.target.value.toLowerCase())}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    {['SD', 'SMP', 'PAUD'].filter(j => j.toLowerCase().includes(jenjangSearch)).map((jenjang) => (
                      <label key={jenjang} className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedJenjang[jenjang]}
                          onChange={() => setCheckedJenjang((p) => ({...p, [jenjang]: !p[jenjang]}))}
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: 'rgb(182, 32, 37)' }}
                        />
                        <span className="flex-1 font-medium">{jenjang}</span>
                        <span className="text-xs text-gray-500">{formatCount(jenjangCounts[jenjang])}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Penerimaan Dropdown (checkbox style like Jenjang) */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('status')}
                  className="h-8 px-4 bg-white border border-gray-300 rounded-md text-[15px] text-gray-600 hover:bg-gray-50 focus:outline-none cursor-pointer font-normal flex items-center justify-between gap-3"
                  style={{minWidth: 212}}
                >
                  <span>Status Penerimaan</span>
                  <svg
                    viewBox="0 0 10 6"
                    aria-hidden="true"
                    className="w-2.5 h-2.5 text-gray-500 shrink-0 ml-2"
                    fill="currentColor"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>

                {activeDropdown === 'status' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg p-3 z-60">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (allStatusSelected) {
                            setCheckedStatus({ diterima: false, tidak: false });
                          } else {
                            setCheckedStatus({ diterima: true, tidak: true });
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded border transition-colors"
                        style={{
                          borderColor: 'rgb(182, 32, 37)',
                          backgroundColor: allStatusSelected ? 'rgb(182, 32, 37)' : 'transparent',
                        }}
                        aria-label={allStatusSelected ? 'Batal semua status' : 'Pilih semua status'}
                      >
                        {allStatusSelected && (
                          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                            <path d="M5 10.5L8.2 13.7L15 6.9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 text-sm font-semibold text-gray-700">Status Penerimaan</div>
                    </div>

                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Ketik untuk menelusuri"
                        value={statusSearch}
                        onChange={(e) => setStatusSearch(e.target.value.toLowerCase())}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    {[
                      { key: 'tidak', label: 'Tidak lulus', count: statusCounts.tidak },
                      { key: 'diterima', label: 'Lulus', count: statusCounts.diterima },
                    ].filter(s => s.label.toLowerCase().includes(statusSearch)).map((st) => (
                      <label key={st.key} className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checkedStatus[st.key]}
                          onChange={() => setCheckedStatus((p) => ({...p, [st.key]: !p[st.key]}))}
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: 'rgb(182, 32, 37)' }}
                        />
                        <span className="flex-1 font-medium">{st.label}</span>
                        <span className="text-xs text-gray-500">{formatCount(st.count)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Jalur Dropdown (checkbox style) */}
              <div className="relative">
                <button
                  onClick={() => toggleDropdown('jalur')}
                  className="h-8 px-4 bg-white border border-gray-300 rounded-md text-[15px] text-gray-600 hover:bg-gray-50 focus:outline-none cursor-pointer font-normal flex items-center justify-between gap-3"
                  style={{minWidth: 180}}
                >
                  <span>Jalur</span>
                  <svg
                    viewBox="0 0 10 6"
                    aria-hidden="true"
                    className="w-2.5 h-2.5 text-gray-500 shrink-0 ml-2"
                    fill="currentColor"
                  >
                    <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </button>

                {activeDropdown === 'jalur' && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-300 rounded shadow-lg p-3 z-60">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (allJalurSelected) {
                            // uncheck all
                            setCheckedJalur((p) => {
                              const next = {};
                              Object.keys(p).forEach((k) => (next[k] = false));
                              return next;
                            });
                          } else {
                            // check all
                            setCheckedJalur((p) => {
                              const next = { ...p };
                              Object.keys(p).forEach((k) => (next[k] = true));
                              return next;
                            });
                          }
                        }}
                        className="w-5 h-5 flex items-center justify-center rounded border transition-colors"
                        style={{
                          borderColor: 'rgb(182, 32, 37)',
                          backgroundColor: allJalurSelected ? 'rgb(182, 32, 37)' : 'transparent',
                        }}
                        aria-label={allJalurSelected ? 'Batal semua jalur' : 'Pilih semua jalur'}
                      >
                        {allJalurSelected && (
                          <svg viewBox="0 0 20 20" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
                            <path d="M5 10.5L8.2 13.7L15 6.9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <div className="flex-1 text-sm font-semibold text-gray-700">Jalur</div>
                    </div>

                    <div className="mb-2">
                      <input
                        type="text"
                        placeholder="Ketik untuk menelusuri"
                        value={jalurSearch}
                        onChange={(e) => setJalurSearch(e.target.value.toLowerCase())}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                    </div>

                    {jalurOptions.filter(j => j.toLowerCase().includes(jalurSearch)).map((j) => (
                      <label key={j} className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!checkedJalur[j]}
                          onChange={() => setCheckedJalur((p) => ({...p, [j]: !p[j]}))}
                          className="w-4 h-4 cursor-pointer"
                          style={{ accentColor: 'rgb(182, 32, 37)' }}
                        />
                        <span className="flex-1 font-medium">{j}</span>
                        <span className="text-xs text-gray-500">{formatCount(jalurCounts[j] || 0)}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative flex-1 overflow-hidden">
          {/* Loading State */}
          {loading && <LoadingOverlay />}

          {/* Error State */}
          {error && <ErrorOverlay error={error} />}

          {/* Map Container */}
          <DeckGL
            className="absolute inset-0"
            viewState={viewState}
            onViewStateChange={handleViewStateChange}
            controller={mapController}
            layers={layers}
            getTooltip={getTooltip}
            useDevicePixels={1}
          >
            <MapView
              className="absolute inset-0"
              mapStyle={MAP_STYLE}
              reuseMaps={true}
              preventStyleDiffing={true}
            />
          </DeckGL>

          {!loading && !error && data.length > 0 && (
            <div className="absolute top-4 left-4 z-40 pointer-events-auto">
              <button
                type="button"
                onClick={handleZoomOutMax}
                title="Zoom out maksimal"
                aria-label="Zoom out maksimal"
                className="w-10 h-10 rounded-md bg-white border border-gray-300 shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M16.2 16.2L20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M8.5 11h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto">
              <StatsPanel stats={filteredStats} />
            </div>
          )}

          {!loading && !error && data.length > 0 && (
            <div className="absolute bottom-4 right-4 z-40 pointer-events-auto overflow-hidden rounded-md border border-gray-300 bg-white shadow-sm">
              <button
                type="button"
                onClick={() => handleZoomStep(1)}
                title="Zoom in"
                aria-label="Zoom in"
                className="flex h-12 w-12 items-center justify-center text-gray-700 hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
              <div className="h-px bg-gray-200" />
              <button
                type="button"
                onClick={() => handleZoomStep(-1)}
                title="Zoom out"
                aria-label="Zoom out"
                className="flex h-12 w-12 items-center justify-center text-gray-700 hover:bg-gray-50"
              >
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
                  <path d="M6 12h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetaMap;
