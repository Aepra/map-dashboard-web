/**
 * Konfigurasi DuckDB dan Data Source
 */
export const DUCKDB_CONFIG = {
  mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-mvp.wasm',
  mainWorker: '/duckdb-browser-mvp.worker.js',
};

// Parquet URL - bisa dari GitHub atau local
// Local path (jika sudah di-download & disimpan di public/data/)
export const PARQUET_URL = '/data/peta_murid.parquet';

// Original GitHub URL (untuk reference/backup)
export const PARQUET_URL_GITHUB = 'https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet';

/**
 * Default View State (Makassar center)
 */
export const DEFAULT_VIEW_STATE = {
  longitude: 119.412,
  latitude: -5.147,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

/**
 * Layer Configuration
 */
export const LAYER_CONFIG = {
  minZoom: 8,
  maxZoom: 15,
  normal: {
    minRadius: 2,
    maxRadius: 8,
    opacity: 0.75,
  },
  dense: {
    minRadius: 1,
    maxRadius: 4,
    opacity: 0.4,
  },
};

/**
 * Color Mapping
 */
export const COLORS = {
  sd: [239, 68, 68],      // Red
  smp: [59, 130, 246],    // Blue
  others: [250, 204, 21], // Yellow
};

/**
 * Map Style
 */
export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
