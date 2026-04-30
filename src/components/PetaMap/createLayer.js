import { ScatterplotLayer } from '@deck.gl/layers';
import { LAYER_CONFIG, COLORS } from './constants';

/**
 * Factory function untuk membuat ScatterplotLayer
 * Optimized dengan memoization di parent component
 */
export const createScatterplotLayer = (filteredData, viewState, vizMode) => {
  const config = vizMode === 'dense' ? LAYER_CONFIG.dense : LAYER_CONFIG.normal;

  const getRadius = () => {
    const minZoom = LAYER_CONFIG.minZoom;
    const maxZoom = LAYER_CONFIG.maxZoom;
    const minRadius = config.minRadius;
    const maxRadius = config.maxRadius;
    const zoomClamped = Math.max(minZoom, Math.min(maxZoom, viewState.zoom));
    return minRadius + ((zoomClamped - minZoom) / (maxZoom - minZoom)) * (maxRadius - minRadius);
  };

  return new ScatterplotLayer({
    id: 'pendaftar-layer',
    data: filteredData,
    getPosition: (d) => [d.bujur, d.lintang],
    getFillColor: (d) => {
      if (d.jenjang.includes('SD')) return COLORS.sd;
      if (d.jenjang.includes('SMP')) return COLORS.smp;
      return COLORS.others;
    },
    getRadius,
    radiusUnits: 'pixels',
    pickable: true,
    opacity: config.opacity,
    stroked: false,
    lineWidthMinPixels: 0,
    updateTriggers: {
      getRadius: [viewState.zoom],
    },
  });
};
