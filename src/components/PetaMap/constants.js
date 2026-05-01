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
  longitude: 118.5,
  latitude: -2.5,
  zoom: 4.8,
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
