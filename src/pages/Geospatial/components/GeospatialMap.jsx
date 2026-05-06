import { useState, useMemo, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MapView } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDuckDBData } from '../hooks/useDuckDBData';
import { useFilteredData } from '../hooks/useFilteredData';
import { useSchoolData } from '../hooks/useSchoolData';
import { useFilterMetrics } from '../hooks/useFilterMetrics';
import { createStudentLayer, createSchoolLayer, createLineLayer } from '../utils/createLayer';
import { DEFAULT_VIEW_STATE, MAP_STYLE } from '../utils/constants';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorOverlay } from '../components/ErrorOverlay';
import { InfoPanel } from '../components/InfoPanel';
import { StatsPanel } from '../components/StatsPanel';



const selectDropdownStyle = {
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '15px',
  fontWeight: 500,
  color: '#334155',
  background: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  outline: 'none',
  minWidth: '160px',
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const missingValueLabels = new Set(['', 'na', 'n/a', 'null', '-']);

const getDisplayValue = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || missingValueLabels.has(text.toLowerCase())) return null;
  return text;
};

// Simple raster satellite basemap (ArcGIS World Imagery)
const SATELLITE_MAP_STYLE = {
  version: 8,
  sources: {
    satellite: {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      minzoom: 0,
    },
  },
  layers: [
    {
      id: 'satellite-layer',
      type: 'raster',
      source: 'satellite',
    },
  ],
};

const normalizeSearchText = (value) => getDisplayValue(value)?.toLowerCase() || '';

const GeospatialMap = ({ onRestart = () => {} }) => {
  const MAX_RENDERED_STUDENTS_NEAR = 12000;
  const MAX_RENDERED_STUDENTS_MID = 8000;
  const MAX_RENDERED_STUDENTS_FAR = 5000;

  const [currentZoom, setCurrentZoom] = useState(DEFAULT_VIEW_STATE.zoom);
  const [isSatellite, setIsSatellite] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJalur, setSelectedJalur] = useState('all');
  const [selectedJenjang, setSelectedJenjang] = useState('keduanya');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [vizMode, setVizMode] = useState('normal');
  const [hoveredInfo, setHoveredInfo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showSatelliteDrawer, setShowSatelliteDrawer] = useState(true);
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  // Keep zoom updates lightweight to avoid re-render storms while panning.
  const lastZoomRef = useRef(DEFAULT_VIEW_STATE.zoom);
  const zoomRafRef = useRef(null);

  const handleViewStateChange = useCallback(({ viewState: nextViewState }) => {
    const nextZoom = nextViewState?.zoom;
    if (typeof nextZoom !== 'number') return;

    // Ignore tiny zoom changes to reduce unnecessary layer recalculation.
    if (Math.abs(nextZoom - lastZoomRef.current) < 0.02) return;

    lastZoomRef.current = nextZoom;
    if (zoomRafRef.current) cancelAnimationFrame(zoomRafRef.current);
    zoomRafRef.current = requestAnimationFrame(() => {
      setCurrentZoom(nextZoom);
      setViewState(nextViewState);
    });
  }, []);

  // Get raw data from DuckDB
  // Pass a stable empty filters object so useDuckDBData's effects don't re-run
  const initialWorkerFilters = useMemo(() => ({}), []);
  const { data, loading, error, stats, dropdownOptions } = useDuckDBData(null, initialWorkerFilters);

  // Extract dropdown values from full cached dataset
  const uniqueJenjang = dropdownOptions.jenjang;
  const uniqueStatus = dropdownOptions.status;
  const uniqueJalur = dropdownOptions.jalur;

  // Build filter object from dropdown selections (memoized)
  const filters = useMemo(() => ({
    checkedJenjang: selectedJenjang === 'keduanya' 
      ? {} 
      : { [selectedJenjang]: true },
    checkedStatus: selectedStatus === 'all' 
      ? {} 
      : { [selectedStatus]: true },
    checkedJalur: selectedJalur === 'all' 
      ? {} 
      : { [selectedJalur]: true },
    selectedSchool: selectedSchool,
  }), [selectedJenjang, selectedStatus, selectedJalur, selectedSchool]);

  // Apply all filters to data
  const filteredData = useFilteredData(data, filters);

  // Aggregate schools from filtered student data
  const schoolData = useSchoolData(filteredData);

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];

    const studentResults = filteredData
      .filter((student) => {
        const idValue = normalizeSearchText(student.id_peserta || student.id || student.pendaftaran_id);
        const schoolValue = normalizeSearchText(student.nama_sekolah_tujuan);
        return idValue.includes(term) || schoolValue.includes(term);
      })
      .slice(0, 5)
      .map((student) => ({
        type: 'student',
        key: `student-${student.id_peserta || student.id || student.pendaftaran_id || student.nama_sekolah_tujuan}`,
        label: `${getDisplayValue(student.id_peserta || student.id || student.pendaftaran_id) || 'ID tidak ada'} - ${getDisplayValue(student.nama_sekolah_tujuan) || 'Sekolah'}`,
        student,
      }));

    const schoolResults = schoolData
      .filter((school) => normalizeSearchText(school.nama).includes(term))
      .slice(0, 5)
      .map((school) => ({
        type: 'school',
        key: `school-${school.nama}`,
        label: school.nama,
        school,
      }));

    return [...studentResults, ...schoolResults].slice(0, 8);
  }, [filteredData, schoolData, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSelectedStudent(null);
    setSelectedSchool(null);
    setIsSearchOpen(false);
  }, []);

  const handleSelectSearchResult = useCallback((result) => {
    if (result.type === 'student') {
      setSelectedStudent(result.student);
      setSelectedSchool(getDisplayValue(result.student.nama_sekolah_tujuan));
      setSearchTerm(`${getDisplayValue(result.student.id_peserta || result.student.id || result.student.pendaftaran_id) || 'ID tidak ada'} - ${getDisplayValue(result.student.nama_sekolah_tujuan) || 'Sekolah'}`);
    } else if (result.type === 'school') {
      setSelectedStudent(null);
      setSelectedSchool(result.school.nama);
      setSearchTerm(result.school.nama);
    }
    setIsSearchOpen(false);
  }, []);

  const activeSchoolName = getDisplayValue(selectedStudent?.nama_sekolah_tujuan) || getDisplayValue(selectedSchool);

  // Reduce render load at low zoom by adaptively sampling points.
  const visibleStudentData = useMemo(() => {
    if (vizMode === 'sekolah') return [];
    if (selectedStudent) return [selectedStudent];

    const totalStudents = filteredData.length;
    if (totalStudents === 0) return [];

    let maxRendered = MAX_RENDERED_STUDENTS_NEAR;
    if (currentZoom < 10) maxRendered = MAX_RENDERED_STUDENTS_MID;
    if (currentZoom < 9) maxRendered = MAX_RENDERED_STUDENTS_FAR;

    if (totalStudents <= maxRendered) return filteredData;

    const step = Math.max(1, Math.ceil(totalStudents / maxRendered));
    return filteredData.filter((_, index) => index % step === 0);
  }, [vizMode, selectedStudent, filteredData, currentZoom]);

  const visibleSchoolData = selectedStudent
    ? schoolData.filter((school) => school.nama === activeSchoolName)
    : schoolData;

  // Calculate metrics for filter labels (use memoized empty filters to keep stable reference)
  const metricsFilterStub = useMemo(() => ({ checkedJenjang: {}, checkedStatus: {}, checkedJalur: {} }), []);
  const metrics = useFilterMetrics(data, metricsFilterStub);

  // Get tooltip content for hovered object (memoized to prevent re-renders)
  const getTooltipContent = useCallback((hovered) => {
    if (!hovered) return null;

    const object = hovered.object;
    if (!object) return null;

    // If hovering over student layer — show compact, non-sensitive summary
    if (hovered.layer?.id === 'pendaftar-layer') {
      const coords = object && object.lintang && object.bujur ? `${Number(object.lintang).toFixed(4)}, ${Number(object.bujur).toFixed(4)}` : '';
      const schoolName = getDisplayValue(object.nama_sekolah_tujuan) || 'Sekolah';
      const jenjang = getDisplayValue(object.jenjang) || '-';
      const jalur = getDisplayValue(object.jalur) || '-';
      const status = getDisplayValue(object.status_penerimaan) || '-';
      return {
        x: hovered.x,
        y: hovered.y,
        html: `
          <div style="padding: 8px; font-size: 12px; color: #111827; max-width: 300px; border-radius: 8px; background: rgba(255,255,255,0.96); box-shadow: 0 4px 20px rgba(2,6,23,0.12);">
            <div style="font-weight:700; margin-bottom:6px;">${schoolName}</div>
            <div style="font-size:12px; color:#374151">Jenjang: <strong style="color:#111827">${jenjang}</strong></div>
            <div style="font-size:12px; color:#374151">Jalur: <strong style="color:#111827">${jalur}</strong></div>
            <div style="font-size:12px; color:#374151">Status: <strong style="color:${status === 'Diterima' ? '#047857' : status === 'Cadangan' ? '#B45309' : '#B91C1C'}">${status}</strong></div>
            ${coords ? `<div style="margin-top:6px;font-size:11px;color:#6b7280">Koordinat: ${coords}</div>` : ''}
          </div>
        `,
      };
    }

    // If hovering over school layer — show counts and quick breakdown
    if (hovered.layer?.id === 'sekolah-layer') {
      const total = object.totalSiswa || 0;
      const sd = object.sdCount || 0;
      const smp = object.smpCount || 0;
      const paud = object.paudCount || 0;
      return {
        x: hovered.x,
        y: hovered.y,
        html: `
          <div style="padding:10px; font-size:12px; color:#0f172a; max-width:320px; border-radius:8px; background:rgba(255,255,255,0.98); box-shadow:0 6px 28px rgba(2,6,23,0.12);">
            <div style="font-weight:700; margin-bottom:6px;">${object.nama || 'Sekolah'}</div>
            <div style="font-size:13px; color:#374151">Total Siswa: <strong style="color:#0b5cff">${total.toLocaleString('id-ID')}</strong></div>
            <div style="font-size:12px; color:#4b5563; margin-top:6px">Rincian: SD ${sd}, SMP ${smp}, PAUD ${paud}</div>
            ${object.bujur && object.lintang ? `<div style="margin-top:6px;font-size:11px;color:#6b7280">Koordinat: ${Number(object.lintang).toFixed(4)}, ${Number(object.bujur).toFixed(4)}</div>` : ''}
          </div>
        `,
      };
    }

    return null;
  }, []);

  // Handle student selection toggle (memoized)
  const handleSelectStudent = useCallback((student) => {
    setSelectedStudent((prev) => {
      if (prev && prev.id_peserta === student.id_peserta) {
        return null;
      }
      return student;
    });
  }, []);

  // Handle school selection toggle (memoized)
  const handleSelectSchool = useCallback((schoolName) => {
    setSelectedSchool((prev) => {
      if (prev === schoolName) {
        return null;
      }
      return schoolName;
    });
  }, []);

  // Build layers: student, school, and optional line (memoized)
  const layers = useMemo(() => {
    const layerList = [];

    // Add student layer (skip when mode is 'sekolah')
    if (vizMode !== 'sekolah' && visibleStudentData.length > 0) {
      layerList.push(
        createStudentLayer(visibleStudentData, currentZoom, vizMode, handleSelectStudent)
      );
    }

    // Add school layer
    if (visibleSchoolData.length > 0) {
      layerList.push(
        createSchoolLayer(visibleSchoolData, currentZoom, handleSelectSchool)
      );
    }

    // Add line layer if student selected
    if (selectedStudent && visibleSchoolData.length > 0) {
      const lineLayer = createLineLayer(selectedStudent, visibleSchoolData, currentZoom);
      if (lineLayer) layerList.push(lineLayer);
    }

    return layerList;
  }, [visibleStudentData, visibleSchoolData, currentZoom, vizMode, selectedStudent, handleSelectStudent, handleSelectSchool]);

  const topBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      padding: '16px 32px',
      background: 'linear-gradient(to right, #ffffff 0%, #fafbfc 100%)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      zIndex: 10,
      gap: 20,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      width: '100%',
      overflow: 'visible',
      transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
      opacity: showNavbar ? 1 : 0,
      pointerEvents: showNavbar ? 'auto' : 'none',
      transition: 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease',
      willChange: 'transform, opacity',
    }}>
      {/* Left: Filters */}
      <div style={{
        display: 'flex',
        gap: 18,
        alignItems: 'center',
        flexWrap: 'wrap',
        minWidth: 0,
        flex: '1 1 auto',
      }}>
        {/* Jalur Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={labelStyle}>Jalur ({metrics.jalurCounts?.[selectedJalur] || 0})</label>
          <select
            value={selectedJalur}
            onChange={e => setSelectedJalur(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="all">Semua</option>
            {uniqueJalur.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Mode Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={labelStyle}>Jenjang</label>
          <select
            value={selectedJenjang}
            onChange={e => setSelectedJenjang(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="keduanya">Semua</option>
            {uniqueJenjang.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={labelStyle}>Status ({metrics.statusCounts?.[selectedStatus] || 0})</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="all">Semua</option>
            {uniqueStatus.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        {/* Viz Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: '8px' }}>
          <label style={labelStyle}>Mode</label>
          <select
            value={vizMode}
            onChange={e => setVizMode(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="normal">Normal</option>
            <option value="dense">Padat</option>
            <option value="sekolah">Sekolah</option>
          </select>
        </div>
      </div>

      {/* Center search */}
      <div style={{
        position: 'relative',
        flex: '1 1 420px',
        maxWidth: '640px',
        minWidth: '340px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: 12, boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)' }}>
          <span style={{ fontSize: 15, lineHeight: 1, color: '#94a3b8' }}>⌕</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsSearchOpen(false), 120);
            }}
            placeholder="Cari ID siswa / nama sekolah"
            style={{
              flex: 1,
              minWidth: 0,
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: '#0f172a',
              background: 'transparent',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                border: 'none',
                background: '#f8fafc',
                color: '#475569',
                borderRadius: 999,
                width: 24,
                height: 24,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700,
              }}
              aria-label="Clear search"
              title="Clear search"
            >
              X
            </button>
          )}
        </div>

        {isSearchOpen && searchTerm.trim() && (
          <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 8px)', zIndex: 20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, boxShadow: '0 16px 40px rgba(15, 23, 42, 0.12)', overflow: 'hidden' }}>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '12px 14px', fontSize: 13, color: '#64748b' }}>Tidak ada hasil.</div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.key}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => handleSelectSearchResult(result)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px 14px',
                      border: 'none',
                      borderBottom: '1px solid #f1f5f9',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', lineHeight: 1.35 }}>{result.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right: restart action */}
      <button
        type="button"
        onClick={onRestart}
        style={{
          marginLeft: 'auto',
          padding: '12px 18px',
          borderRadius: 12,
          border: '1px solid #fecaca',
          background: 'linear-gradient(180deg, #fff1f2 0%, #ffe4e6 100%)',
          color: '#991b1b',
          fontSize: 14,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
          whiteSpace: 'nowrap',
        }}
      >
        Restart
      </button>
      <div
        style={{
          position: 'absolute',
          top: 90,
          right: showSatelliteDrawer ? 5 : -170,
          zIndex: 23,
          width: 170,
          padding: 8,
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 10px 26px rgba(15, 23, 42, 0.10)',
          transition: 'right 0.32s cubic-bezier(0.22, 1, 0.36, 1)',
          overflow: 'visible',
          display: 'flex',
          alignItems: 'stretch',
          gap: 8,
        }}
      >
        <button
          type="button"
          onClick={() => setShowSatelliteDrawer((prev) => !prev)}
          aria-label={showSatelliteDrawer ? 'Sembunyikan drawer peta' : 'Tampilkan drawer peta'}
          title={showSatelliteDrawer ? 'Sembunyikan drawer peta' : 'Tampilkan drawer peta'}
          style={{
            position: 'absolute',
            left: -32,
            top: 18,
            width: 36,
            height: 36,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            color: '#0f172a',
            fontSize: 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          }}
        >
          {showSatelliteDrawer ? '<' : '>'}
        </button>

        <button
          type="button"
          onClick={() => setIsSatellite(false)}
          title="Default"
          aria-label="Default"
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 6px',
            borderRadius: 10,
            border: isSatellite ? '1px solid #e2e8f0' : '2px solid #0ea5e9',
            background: isSatellite ? '#fff' : '#ecf8ff',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 34, height: 34, backgroundImage: 'url(//maps.gstatic.com/tactile/layerswitcher/ic_default_colors2-2x.png)', backgroundSize: '34px 34px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
          <div style={{ fontSize: 11, lineHeight: 1, fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>DEFAULT</div>
        </button>

        <button
          type="button"
          onClick={() => setIsSatellite(true)}
          title="Satelite"
          aria-label="Satelite"
          style={{
            flex: '1 1 0',
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '8px 6px',
            borderRadius: 10,
            border: isSatellite ? '2px solid #0f172a' : '1px solid #e2e8f0',
            background: isSatellite ? '#f0f4f8' : '#fff',
            cursor: 'pointer',
          }}
        >
          <div style={{ width: 34, height: 34, backgroundImage: 'url(//maps.gstatic.com/tactile/layerswitcher/ic_satellite-2x.png)', backgroundSize: '34px 34px', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
          <div style={{ fontSize: 11, lineHeight: 1, fontWeight: 800, color: '#0f172a', letterSpacing: '0.3px' }}>SATELITE</div>
        </button>
      </div>

    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#FAFBFC' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        {topBar}
      </div>
      <button
        type="button"
        onClick={() => setShowNavbar((current) => !current)}
        aria-label={showNavbar ? 'Tutup navbar' : 'Buka navbar'}
        title={showNavbar ? 'Tutup navbar' : 'Buka navbar'}
        style={{
          position: 'absolute',
          left: '50%',
          top: showNavbar ? 80 : 0,
          transform: 'translateX(-50%)',
          width: 46,
          height: 28,
          borderRadius: '0 0 12px 12px',
          border: '1px solid #e2e8f0',
          borderTop: 'none',
          background: '#fff',
          color: 'rgb(182, 32, 37)',
          fontSize: 15,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          zIndex: 25,
          transition: 'top 0.42s cubic-bezier(0.22, 1, 0.36, 1), transform 0.18s ease',
        }}
      >
        {showNavbar ? '^' : 'v'}
      </button>

      {loading && data.length === 0 && <LoadingOverlay />}
      {error && <ErrorOverlay message={error} />}
      
      <DeckGL
        initialViewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={{
          dragPan: true,
          dragRotate: false,
          doubleClickZoom: true,
          touchZoom: true,
          touchRotate: false,
          scrollZoom: true,
          inertia: 180,
          maxZoom: isSatellite ? 16 : 18,
          minZoom: 3,
        }}
        layers={layers}
        onHover={(hovered) => setHoveredInfo(getTooltipContent(hovered))}
        getCursor={() => 'pointer'}
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <MapView
          mapStyle={isSatellite ? SATELLITE_MAP_STYLE : MAP_STYLE}
          attributionControl={false}
        />
      </DeckGL>

      {/* Hover Tooltip */}
      {hoveredInfo && (
        <div
          style={{
            position: 'absolute',
            left: `${hoveredInfo.x + 10}px`,
            top: `${hoveredInfo.y + 10}px`,
            zIndex: 50,
            pointerEvents: 'none',
          }}
          dangerouslySetInnerHTML={{ __html: hoveredInfo.html }}
        />
      )}

      {/* Info Panel - Bottom Left: student or school details */}
      {selectedStudent && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100 }}>
          <InfoPanel
            selectedStudent={selectedStudent}
            selectedSchool={selectedSchool}
            onClose={() => setSelectedStudent(null)}
          />
        </div>
      )}
      {!selectedStudent && selectedSchool && (
        <div style={{ position: 'absolute', bottom: 20, left: 20, zIndex: 100 }}>
          <InfoPanel
            selectedStudent={null}
            selectedSchool={activeSchoolName}
            schoolData={visibleSchoolData.length > 0 ? visibleSchoolData : schoolData}
            onClose={() => setSelectedSchool(null)}
          />
        </div>
      )}

      {/* Stats Panel - Bottom Center */}
      {!loading && (
        <div 
          style={{ 
            position: 'absolute', 
            bottom: 20, 
            left: '50%', 
            transform: showNavbar ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(120%)',
            opacity: showNavbar ? 1 : 0,
            zIndex: 100,
            transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease',
            pointerEvents: showNavbar ? 'auto' : 'none',
          }}
        >
          <StatsPanel
            totalData={filteredData.length}
            totalStats={stats}
          />
        </div>
      )}
    </div>
  );
};

export default GeospatialMap;