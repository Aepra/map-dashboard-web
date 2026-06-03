/**
 * Konfigurasi DuckDB dan Data Source
 * 
 * Data source is loaded directly from VITE_DATA_SOURCE_URL.
 */
export const DUCKDB_CONFIG = {
  mainModule: 'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm@1.28.0/dist/duckdb-mvp.wasm',
  mainWorker: '/duckdb-browser-mvp.worker.js',
};

// Deployment type label (remote by default)
const DEPLOY_TYPE = import.meta.env.VITE_DEPLOY_TYPE || 'remote';

const DEFAULT_REMOTE_PARQUET_URL = 'https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet';
const REMOTE_PARQUET_URL = import.meta.env.VITE_DATA_SOURCE_URL || DEFAULT_REMOTE_PARQUET_URL;

export const PARQUET_URL = REMOTE_PARQUET_URL;
export const PARQUET_URL_REMOTE = REMOTE_PARQUET_URL;
export const DEPLOYMENT_TYPE = DEPLOY_TYPE;

/**
 * Default View State (Makassar center)
 */
export const DEFAULT_VIEW_STATE = {
  // Centered on Makassar city with overview zoom
  longitude: 119.4327,
  latitude: -5.1477,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

/**
 * Layer Configuration - Optimized for smooth zoom with adaptive radius
 */
export const LAYER_CONFIG = {
  minZoom: 3,
  maxZoom: 22,
  // Zoom-based rendering levels (Level of Detail)
  zoomLevels: {
    // Level 0: Very far (zoom < 8) - Show aggregated clusters
    veryFar: { zoom: [3, 8], radius: [0.8, 2.0], opacity: [0.5, 0.6], pickable: false },
    // Level 1: Far (8 <= zoom < 11) - Small dots
    far: { zoom: [8, 11], radius: [1.5, 3.5], opacity: [0.6, 0.65], pickable: true },
    // Level 2: Medium (11 <= zoom < 14) - Medium dots
    medium: { zoom: [11, 14], radius: [3.5, 7], opacity: [0.65, 0.75], pickable: true },
    // Level 3: Close (zoom >= 14) - Large, detailed dots
    close: { zoom: [14, 20], radius: [6.5, 13], opacity: [0.75, 0.85], pickable: true },
  },
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

// Palette for distinct PAUD school colors
export const PAUD_COLORS = [
  [255, 59, 48],   // Bright Red
  [52, 199, 89],   // Bright Green
  [0, 122, 255],   // Bright Blue
  [255, 149, 0],   // Bright Orange
  [175, 82, 222],  // Bright Purple
  [90, 200, 250],  // Bright Cyan
  [255, 45, 85],   // Bright Magenta
  [255, 214, 10],  // Bright Yellow
  [255, 105, 180], // Bright Pink
  [0, 199, 190],   // Bright Teal
  [255, 179, 64],  // Bright Apricot
  [88, 86, 214],   // Bright Indigo
  [255, 204, 0],   // Bright Gold
  [76, 217, 100],  // Bright Mint
  [255, 69, 58],   // Bright Coral
  [64, 156, 255],  // Bright Sky
  [255, 87, 34],   // Bright Deep Orange
  [186, 104, 200], // Bright Violet
  [0, 230, 118],   // Bright Emerald
  [255, 193, 7],   // Bright Amber
];

// Palette for distinct SMP school colors
export const SMP_COLORS = [
  [37, 99, 235],   // Blue
  [30, 136, 229],  // Light Blue
  [79, 70, 229],   // Indigo
  [99, 102, 241],  // Soft Indigo
  [56, 189, 248],  // Sky
  [14, 165, 233],  // Cyan Blue
  [2, 132, 199],   // Strong Cyan
  [41, 121, 255],  // Bright Azure
  [66, 165, 245],  // Blue 400
  [25, 118, 210],  // Blue 700
  [84, 110, 122],  // Blue Gray
  [0, 172, 193],   // Teal Cyan
  [3, 105, 161],   // Dark Sky
  [59, 130, 246],  // Tailwind Blue
  [38, 198, 218],  // Aqua
  [0, 188, 212],   // Cyan
];

/**
 * Map Style
 */
export const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
