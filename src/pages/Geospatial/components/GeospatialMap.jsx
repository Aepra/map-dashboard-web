import { useState, useMemo, useRef, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MapView } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDuckDBData } from '../hooks/useDuckDBData';
import { useFilteredData } from '../hooks/useFilteredData';
import { useSchoolData } from '../hooks/useSchoolData';
import { useFilterMetrics } from '../hooks/useFilterMetrics';
import { createStudentLayer, createSchoolLayer, createLineLayer } from '../utils/createLayer';
import { DEFAULT_VIEW_STATE, LAYER_CONFIG, MAP_STYLE } from '../utils/constants';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ErrorOverlay } from '../components/ErrorOverlay';
import { InfoPanel } from '../components/InfoPanel';
import { StatsPanel } from '../components/StatsPanel';

const selectDropdownStyle = {
  padding: '8px 12px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  fontWeight: 500,
  color: '#334155',
  background: '#fff',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  outline: 'none',
  minWidth: '130px',
};

const labelStyle = {
  fontSize: '12px',
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

const GeospatialMap = () => {
  const [currentZoom, setCurrentZoom] = useState(DEFAULT_VIEW_STATE.zoom);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedJalur, setSelectedJalur] = useState('all');
  const [selectedJenjang, setSelectedJenjang] = useState('keduanya');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [vizMode, setVizMode] = useState('normal');
  const [hoveredInfo, setHoveredInfo] = useState(null);

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

  const activeSchoolName = getDisplayValue(selectedStudent?.nama_sekolah_tujuan) || getDisplayValue(selectedSchool);
  const visibleStudentData = selectedStudent ? [selectedStudent] : filteredData;
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

    // Add student layer
    if (visibleStudentData.length > 0) {
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

          {(selectedStudent ? visibleStudentData.length : filteredData.length).toLocaleString('id-ID')}
  const topBar = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 28px',
      background: 'linear-gradient(to right, #ffffff 0%, #fafbfc 100%)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      zIndex: 10,
      gap: 16,
    }}>
      {/* Left: Filters */}
      <div style={{
        display: 'flex',
        gap: 16,
        alignItems: 'center',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: '16px' }}>
          <label style={labelStyle}>Mode</label>
          <select
            value={vizMode}
            onChange={e => setVizMode(e.target.value)}
            style={selectDropdownStyle}
          >
            <option value="normal">Normal</option>
            <option value="dense">Padat</option>
          </select>
        </div>
      </div>

      {/* Right: Total Count */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 14px',
        background: '#eff6ff',
        borderRadius: '6px',
        border: '1px solid #bfdbfe',
        marginLeft: 'auto',
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          color: '#64748b',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Total
        </span>
        <span style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#1e40af',
        }}>
          {filteredData.length.toLocaleString('id-ID')}
        </span>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f9fafb' }}>
      {topBar}
      {loading && <LoadingOverlay />}
      {error && <ErrorOverlay message={error} />}
      
      <DeckGL
        initialViewState={DEFAULT_VIEW_STATE}
        onViewStateChange={handleViewStateChange}
        controller={{
          minZoom: 9,
          maxZoom: 16,
          dragPan: true,
          dragRotate: false,
          doubleClickZoom: true,
          touchZoom: true,
          touchRotate: false,
          scrollZoom: true,
          inertia: 180,
        }}
        layers={layers}
        onHover={(hovered) => setHoveredInfo(getTooltipContent(hovered))}
        getCursor={() => 'pointer'}
        style={{ width: '100%', height: 'calc(100% - 44px)', position: 'relative' }}
      >
        <MapView mapStyle={MAP_STYLE} />
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
      <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
        <StatsPanel
          totalData={filteredData.length}
          totalStats={stats}
        />
      </div>
    </div>
  );
};

export default GeospatialMap;