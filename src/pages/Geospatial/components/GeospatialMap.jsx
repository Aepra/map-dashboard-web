import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
import FloatingRestartButton from '../../../components/FloatingRestartButton';
import logoColor from '../../../assets/images/ICON_SPMB.svg';



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

const ChevronIcon = ({ direction = 'left' }) => {
  const rotate = direction === 'right' ? 180 : 0;

  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <path
        d="M14.5 6.5L9 12l5.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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
  const [viewportWidth, setViewportWidth] = useState(() => window.innerWidth);
  const [topBarHeight, setTopBarHeight] = useState(96);
  const [hoveredHeaderItem, setHoveredHeaderItem] = useState(null);
  const topBarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = viewportWidth <= 768;
  const isTablet = viewportWidth <= 1024 && viewportWidth > 768;
  const isResponsiveLayout = isMobile || isTablet;
  const isCompactHeader = isResponsiveLayout;
  const isHeaderStacked = topBarHeight > (isMobile ? 180 : isTablet ? 150 : 128);

  useEffect(() => {
    if (!topBarRef.current) return;

    const updateTopBarHeight = () => {
      const height = Math.ceil(topBarRef.current?.getBoundingClientRect().height || 96);
      setTopBarHeight(height);
    };

    updateTopBarHeight();

    const observer = new ResizeObserver(updateTopBarHeight);
    observer.observe(topBarRef.current);

    return () => observer.disconnect();
  }, [viewportWidth, showNavbar]);

  const responsiveSelectStyle = {
    ...selectDropdownStyle,
    minWidth: 0,
    width: '100%',
    padding: isMobile ? '4px 6px' : isTablet ? '5px 7px' : '5px 8px',
    fontSize: isMobile ? 11 : 12,
    boxSizing: 'border-box',
    borderRadius: 8,
    background: '#fff',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    boxShadow: 'none',
  };

  const responsiveLabelStyle = {
    ...labelStyle,
    fontSize: isMobile ? 9 : 10,
    letterSpacing: isMobile ? '0.12px' : '0.18px',
    lineHeight: 1.1,
    color: '#475569',
  };

  const filterItemStyle = (accent = 'blue') => {
    const accentMap = {
      blue: '#3b82f6',
      green: '#22c55e',
      amber: '#f59e0b',
      purple: '#a855f7',
    };
    const accentColor = accentMap[accent] || '#3b82f6';
    const isHovered = hoveredHeaderItem === accent;

    return {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: isMobile ? 'calc(50% - 8px)' : isTablet ? '160px' : '150px',
      minWidth: isMobile ? 'calc(50% - 8px)' : isTablet ? '160px' : '150px',
      flex: isMobile ? '1 1 calc(50% - 8px)' : isTablet ? '0 0 160px' : '0 0 150px',
      gap: isMobile ? 2 : 3,
      padding: isMobile ? '4px 5px' : '5px 7px',
      border: 'none',
      borderRadius: 10,
      background: '#fff',
      boxShadow: isHovered ? `inset 0 -2px 0 ${accentColor}` : 'none',
      boxSizing: 'border-box',
      transition: 'box-shadow 0.18s ease, background 0.18s ease',
    };
  };

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
    <div
      ref={topBarRef}
      style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
      padding: isMobile ? '10px 12px' : isTablet ? '12px 18px' : '16px 24px',
      background: '#fff',
      borderBottom: 'none',
      boxShadow: 'none',
      zIndex: 10,
      gap: isMobile ? 5 : 7,
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
      fontFamily: 'Nunito, sans-serif',
    }}>
      {/* Right logo moves to top on tablet/mobile - now only a single combined image */}
      <div style={{
        order: isCompactHeader ? 0 : 3,
        position: 'static',
        marginLeft: isCompactHeader ? 0 : 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flex: isCompactHeader ? '0 1 100%' : '0 1 160px',
        width: isCompactHeader ? '100%' : 'auto',
        zIndex: 12,
        minWidth: 56,
      }}>
        <img
          src={logoColor}
          alt="SPMB Disdik Makassar 2026"
          style={{ width: '100%', maxWidth: isHeaderStacked ? (isMobile ? 86 : isTablet ? 112 : 130) : isMobile ? 96 : isTablet ? 140 : 188, height: 'auto', objectFit: 'contain', display: 'block', transition: 'max-width 0.25s ease' }}
        />
      </div>

      {/* Search first */}
      <div style={{
        position: 'relative',
        order: 1,
        flex: isCompactHeader ? '1 1 100%' : '1 1 200px',
        maxWidth: isMobile ? '100%' : '420px',
        minWidth: isMobile ? 0 : '120px',
      }}>
        <div style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: '#475569', letterSpacing: isMobile ? '0.12px' : '0.2px', marginBottom: 5, textTransform: 'uppercase' }}>
          Cari sekolah / ID peserta
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 5 : 7, padding: isMobile ? '5px 7px' : '6px 9px', background: '#fff', border: '1px solid rgba(148, 163, 184, 0.14)', borderRadius: 10, boxShadow: hoveredHeaderItem === 'search' ? 'inset 0 -2px 0 #3b82f6' : 'none', transition: 'box-shadow 0.18s ease, background 0.18s ease, border-color 0.18s ease' }} onMouseEnter={() => setHoveredHeaderItem('search')} onMouseLeave={() => setHoveredHeaderItem(null)}>
          <span style={{ fontSize: isMobile ? 13 : 15, lineHeight: 1, color: '#2563eb' }}>⌕</span>
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
              fontSize: isMobile ? 12 : 13,
              color: '#1e293b',
              background: 'transparent',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              style={{
                border: 'none',
                background: '#eef2ff',
                color: '#2563eb',
                borderRadius: 999,
                width: 20,
                height: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: isMobile ? 12 : 13,
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
          <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 20, background: '#fff', border: '1px solid rgba(148, 163, 184, 0.12)', borderRadius: 10, boxShadow: '0 8px 20px rgba(15, 23, 42, 0.03)', overflow: 'hidden' }}>
            <div style={{ maxHeight: 240, overflowY: 'auto' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>Tidak ada hasil.</div>
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
                      padding: '8px 12px',
                      border: 'none',
                      borderBottom: 'none',
                      background: 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(event) => { event.currentTarget.style.background = '#eff6ff'; }}
                    onMouseLeave={(event) => { event.currentTarget.style.background = 'white'; }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#0f172a', lineHeight: 1.25 }}>{result.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Filters order: Jalur, Jenjang, Status, Mode */}
      <div style={{
        display: 'flex',
        order: 2,
        gap: isMobile ? 5 : 7,
        alignItems: 'center',
        flexWrap: 'wrap',
        minWidth: 0,
        flex: isCompactHeader ? '1 1 100%' : '1 1 auto',
        marginLeft: 0,
      }}>
        <div
          style={filterItemStyle('blue')}
          onMouseEnter={() => setHoveredHeaderItem('blue')}
          onMouseLeave={() => setHoveredHeaderItem(null)}
        >
          <label style={responsiveLabelStyle}>Jalur ({metrics.jalurCounts?.[selectedJalur] || 0})</label>
          <select
            value={selectedJalur}
            onChange={e => setSelectedJalur(e.target.value)}
            style={responsiveSelectStyle}
          >
            <option value="all">Semua</option>
            {uniqueJalur.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div
          style={filterItemStyle('green')}
          onMouseEnter={() => setHoveredHeaderItem('green')}
          onMouseLeave={() => setHoveredHeaderItem(null)}
        >
          <label style={responsiveLabelStyle}>Jenjang</label>
          <select
            value={selectedJenjang}
            onChange={e => setSelectedJenjang(e.target.value)}
            style={responsiveSelectStyle}
          >
            <option value="keduanya">Semua</option>
            {uniqueJenjang.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div
          style={filterItemStyle('amber')}
          onMouseEnter={() => setHoveredHeaderItem('amber')}
          onMouseLeave={() => setHoveredHeaderItem(null)}
        >
          <label style={responsiveLabelStyle}>Status ({metrics.statusCounts?.[selectedStatus] || 0})</label>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            style={responsiveSelectStyle}
          >
            <option value="all">Semua</option>
            {uniqueStatus.map(val => (
              <option key={val} value={val}>{val}</option>
            ))}
          </select>
        </div>

        <div
          style={filterItemStyle('purple')}
          onMouseEnter={() => setHoveredHeaderItem('purple')}
          onMouseLeave={() => setHoveredHeaderItem(null)}
        >
          <label style={responsiveLabelStyle}>Mode</label>
          <select
            value={vizMode}
            onChange={e => setVizMode(e.target.value)}
            style={responsiveSelectStyle}
          >
            <option value="normal">Normal</option>
            <option value="dense">Padat</option>
            <option value="sekolah">Sekolah</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 50%, #f9fafb 100%)' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20 }}>
        {topBar}
      </div>
      <FloatingRestartButton
        onRestart={onRestart}
        bottom={isResponsiveLayout ? (isMobile ? '74px' : '82px') : '24px'}
        left={isResponsiveLayout ? '12px' : '24px'}
        compact={isResponsiveLayout}
      />
      <button
        type="button"
        onClick={() => setShowNavbar((current) => !current)}
        aria-label={showNavbar ? 'Tutup navbar' : 'Buka navbar'}
        title={showNavbar ? 'Tutup navbar' : 'Buka navbar'}
        style={{
          position: 'absolute',
          left: '50%',
          top: showNavbar ? topBarHeight : 0,
          transform: 'translateX(-50%)',
          width: isMobile ? 42 : 46,
          height: isMobile ? 26 : 28,
          borderRadius: '0 0 10px 10px',
          border: '1px solid rgba(148, 163, 184, 0.18)',
          borderTop: 'none',
          background: '#fff',
          color: '#2563eb',
          fontSize: isMobile ? 13 : 15,
          fontWeight: 800,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
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

      <div
        style={{
          position: 'absolute',
          right: showSatelliteDrawer ? (isMobile ? 8 : isTablet ? 10 : 12) : (isMobile ? -142 : isTablet ? -160 : -185),
          bottom: isMobile ? 8 : 12,
          zIndex: 23,
          width: isMobile ? 132 : isTablet ? 148 : 176,
          padding: isMobile ? 6 : isTablet ? 7 : 8,
          borderRadius: isMobile ? 12 : 16,
          border: 'none',
          background: '#fff',
          backdropFilter: 'blur(10px)',
          boxShadow: 'none',
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
            left: isMobile ? -28 : -33,
            top: '50%',
            transform: 'translateY(-50%)',
            width: isMobile ? 26 : 32,
            height: isMobile ? 26 : 32,
            borderRadius: 999,
            border: 'none',
            background: '#fff',
            color: '#3b82f6',
            fontSize: isMobile ? 12 : 14,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: hoveredHeaderItem === 'drawer-toggle' ? 'inset 0 -2px 0 #3b82f6' : 'none',
          }}
          onMouseEnter={() => setHoveredHeaderItem('drawer-toggle')}
          onMouseLeave={() => setHoveredHeaderItem(null)}
        >
          <ChevronIcon direction={showSatelliteDrawer ? 'left' : 'right'} />
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
            gap: isMobile ? 3 : isTablet ? 4 : 6,
            padding: isMobile ? '5px 4px' : isTablet ? '6px 5px' : '8px 6px',
            borderRadius: isMobile ? 8 : 10,
            border: isSatellite ? '1px solid rgba(148, 163, 184, 0.12)' : '1px solid rgba(59, 130, 246, 0.12)',
            background: isSatellite ? 'rgba(255,255,255,0.96)' : 'rgba(239,246,255,0.96)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ width: isMobile ? 24 : isTablet ? 28 : 34, height: isMobile ? 24 : isTablet ? 28 : 34, backgroundImage: 'url(//maps.gstatic.com/tactile/layerswitcher/ic_default_colors2-2x.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
          <div style={{ fontSize: isMobile ? 8 : isTablet ? 9 : 11, lineHeight: 1, fontWeight: 800, color: '#0f172a', letterSpacing: isMobile ? '0.1px' : '0.3px' }}>DEFAULT</div>
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
            gap: isMobile ? 3 : isTablet ? 4 : 6,
            padding: isMobile ? '5px 4px' : isTablet ? '6px 5px' : '8px 6px',
            borderRadius: isMobile ? 8 : 10,
            border: isSatellite ? '1px solid rgba(37, 99, 235, 0.16)' : '1px solid rgba(148, 163, 184, 0.12)',
            background: isSatellite ? 'rgba(255,255,255,0.98)' : 'rgba(255,255,255,0.96)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ width: isMobile ? 24 : isTablet ? 28 : 34, height: isMobile ? 24 : isTablet ? 28 : 34, backgroundImage: 'url(//maps.gstatic.com/tactile/layerswitcher/ic_satellite-2x.png)', backgroundSize: '100% 100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }} />
          <div style={{ fontSize: isMobile ? 8 : isTablet ? 9 : 11, lineHeight: 1, fontWeight: 800, color: '#0f172a', letterSpacing: isMobile ? '0.1px' : '0.3px' }}>SATELITE</div>
        </button>
      </div>

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
            bottom: isResponsiveLayout ? 12 : 20,
            left: isResponsiveLayout ? 12 : '50%',
            transform: showNavbar
              ? isResponsiveLayout
                ? 'translateX(0) translateY(0)'
                : 'translateX(-50%) translateY(0)'
              : isResponsiveLayout
                ? 'translateX(0) translateY(120%)'
                : 'translateX(-50%) translateY(120%)',
            opacity: showNavbar ? 1 : 0,
            zIndex: 100,
            transition: 'transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease',
            pointerEvents: showNavbar ? 'auto' : 'none',
            maxWidth: isResponsiveLayout ? 'calc(100vw - 170px)' : 'none',
          }}
        >
          <StatsPanel
            totalData={filteredData.length}
            totalStats={stats}
            compact={isResponsiveLayout}
          />
        </div>
      )}
    </div>
  );
};

export default GeospatialMap;