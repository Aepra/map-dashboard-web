import React, { useState, useMemo, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Hooks & Utilities
import { useDuckDBData } from './PetaMap/useDuckDBData';
import { useFilteredData } from './PetaMap/useFilteredData';
import { createScatterplotLayer } from './PetaMap/createLayer';

// Components
import { LoadingOverlay } from './PetaMap/LoadingOverlay';
import { ErrorOverlay } from './PetaMap/ErrorOverlay';
import { ControlPanel } from './PetaMap/ControlPanel';
import { StatsPanel } from './PetaMap/StatsPanel';
import { InfoPanel } from './PetaMap/InfoPanel';

// Constants
import { DEFAULT_VIEW_STATE, MAP_STYLE } from './PetaMap/constants';

/**
 * PetaMap Component - Main Map Dashboard
 * Renders 83.416 student registration data with filtering & visualization
 */
const PetaMap = () => {
  // Data Loading
  const { data, loading, error, stats } = useDuckDBData();

  // View State
  const [viewState, setViewState] = useState(DEFAULT_VIEW_STATE);

  // Filter State - Checkbox untuk jenjang
  const [checkedJenjang, setCheckedJenjang] = useState({
    SD: true,
    SMP: true,
    PAUD: true,
  });
  const [selectedStatus, setSelectedStatus] = useState('semua');
  const [vizMode, setVizMode] = useState('normal');

  // Filtered Data
  const filteredData = useFilteredData(data, checkedJenjang, selectedStatus);

  /**
   * Memoized Layers - recalculate hanya saat data/zoom/vizMode berubah
   */
  const layers = useMemo(
    () => {
      if (filteredData.length === 0) return [];
      return [createScatterplotLayer(filteredData, viewState, vizMode)];
    },
    [filteredData, viewState.zoom, vizMode]
  );

  /**
   * Memoized Tooltip
   */
  const getTooltip = useCallback(({ object }) => {
    if (!object) return null;
    return {
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 10px; max-width: 280px; font-size: 12px;">
          <div style="font-weight: 600; color: #1e40af; margin-bottom: 6px;">${
            object.nama_sekolah_tujuan || 'N/A'
          }</div>
          <div style="border-bottom: 1px solid #e5e7eb; padding: 6px 0; font-size: 11px;">
            <div><strong>Jenjang:</strong> ${object.jenjang || 'N/A'}</div>
            <div><strong>Status:</strong> ${object.status_penerimaan || 'N/A'}</div>
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

  return (
    <div className="relative w-full h-screen bg-gray-50">
      {/* Loading State */}
      {loading && <LoadingOverlay />}

      {/* Error State */}
      {error && <ErrorOverlay error={error} />}

      {/* Control Panel */}
      {!loading && !error && data.length > 0 && (
        <ControlPanel
          checkedJenjang={checkedJenjang}
          setCheckedJenjang={setCheckedJenjang}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
          vizMode={vizMode}
          setVizMode={setVizMode}
          filteredCount={filteredData.length}
          totalCount={stats.total}
        />
      )}

      {/* Map Container */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={handleViewStateChange}
        controller={true}
        layers={layers}
        getTooltip={getTooltip}
        useDevicePixels={true}
      >
        <Map
          mapStyle={MAP_STYLE}
          reuseMaps={true}
          preventStyleDiffing={true}
        />
      </DeckGL>

      {/* Stats Panel */}
      {!loading && !error && data.length > 0 && <StatsPanel stats={stats} />}

      {/* Info Panel */}
      <InfoPanel />
    </div>
  );
};

export default PetaMap;
