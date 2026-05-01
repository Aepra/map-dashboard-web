# 🏗️ PetaMap Component Architecture

## Struktur Folder (Refactored)

```
src/components/
├── PetaMap.jsx                          # Main component (hanya 100+ lines)
└── PetaMap/
    ├── constants.js                      # Config & constants
    ├── useDuckDBData.js                  # Hook: DuckDB initialization & data loading
    ├── useFilteredData.js                # Hook: Filtering logic
    ├── useFilterMetrics.js               # Hook: Dropdown counts & format helper
    ├── useSchoolData.js                  # Hook: Aggregate school markers
    ├── createLayer.js                    # Layer factory function
    ├── LoadingOverlay.jsx                # Loading state UI
    ├── ErrorOverlay.jsx                  # Error state UI
    ├── ControlPanel.jsx                  # Filter & visualization controls
    ├── StatsPanel.jsx                    # Statistics display
    └── InfoPanel.jsx                     # Info & instructions
```

## Deskripsi Setiap File

### **PetaMap.jsx** (Main Component)
- Orkestrasi component utama
- Import semua sub-components & hooks
- Manage state: `viewState`, `selectedJenjang`, `selectedStatus`, `vizMode`
- Gabung semuanya menjadi satu map dashboard
- **Size**: ~120 lines (dari 350+ lines sebelumnya!)

### **constants.js**
- `DUCKDB_CONFIG`: Konfigurasi DuckDB worker & WASM
- `PARQUET_URL`: URL data source Parquet
- `DEFAULT_VIEW_STATE`: Initial map view (Makassar center)
- `LAYER_CONFIG`: Radius & opacity untuk normal/dense mode
- `COLORS`: RGB mapping untuk SD/SMP/others
- `MAP_STYLE`: CartoDB Positron basemap URL

### **useDuckDBData.js** (Custom Hook)
- Menangani DuckDB initialization
- Load Parquet file dari GitHub
- Transform & validate data (coordinate filtering)
- Calculate statistics (SD/SMP/PAUD counts)
- Return: `{ data, loading, error, stats }`

### **useFilteredData.js** (Custom Hook)
- Memoized filtering by jenjang & status
- Dependency: `[data, selectedJenjang, selectedStatus]`
- Return: filtered array (only recalculate when dependencies change)

### **useFilterMetrics.js** (Custom Hook)
- Computes jenjang, status, and jalur counts from the raw dataset
- Exposes `formatCount()` for compact dropdown labels
- Keeps metric logic out of the main component

### **useSchoolData.js** (Custom Hook)
- Aggregates per-school markers for the map layer
- Calculates median coordinates so school pins stay stable
- Keeps school-layer logic isolated from `PetaMap.jsx`

### **createLayer.js** (Layer Factory)
- Factory function untuk membuat ScatterplotLayer
- Parameter: `filteredData`, `viewState`, `vizMode`
- Zoom-responsive radius calculation
- Color-coded by education level
- Performance optimizations: `stroked: false`

### **LoadingOverlay.jsx**
- Animated loading indicator (3 bouncing dots)
- Message: "Memproses Data..."
- Shown while DuckDB processes Parquet file

### **ErrorOverlay.jsx**
- Error message display
- Reload button untuk retry
- Shown jika ada error saat loading data

### **ControlPanel.jsx**
- Jenjang filter buttons: semua / SD / SMP / PAUD
- Visualization mode toggle: Normal / Dense
- Shows: "Showing: X / Y records"
- Position: Top-left corner

### **StatsPanel.jsx**
- Statistics breakdown:
  - Total: 83.414
  - SD: 41.556 (red dot)
  - SMP: 41.197 (blue dot)
  - PAUD: 661 (yellow dot)
- Status: "✅ Rendering smooth & lancar"
- Position: Bottom-left corner

### **InfoPanel.jsx**
- Title: "🗺️ Peta PPDB Makassar"
- Instructions: "83.416 data. Zoom & drag lancar. Filter = instant 0 lag!"
- Position: Top-right corner

## Keuntungan Refactoring

✅ **Code Organization**: Setiap file punya satu responsibility  
✅ **Reusability**: Hooks & components bisa digunakan di komponen lain  
✅ **Maintainability**: Lebih mudah untuk update/debug individual parts  
✅ **Testability**: Setiap module bisa di-test secara terpisah  
✅ **Performance**: useMemo & useCallback tetap intact  
✅ **Cleaner Main Component**: PetaMap.jsx sekarang hanya ~120 lines  
✅ **Easy to Read**: Structure jelas, mudah dipahami newcomers  

## Import Flow

```
PetaMap.jsx
├── imports useDuckDBData.js
│   └── imports constants.js
├── imports useFilteredData.js
├── imports createLayer.js
│   └── imports constants.js
├── imports LoadingOverlay.jsx
├── imports ErrorOverlay.jsx
├── imports ControlPanel.jsx
├── imports StatsPanel.jsx
├── imports InfoPanel.jsx
└── imports constants.js
```

## Usage Example

```jsx
// Simply import & use
import PetaMap from './components/PetaMap';

function App() {
  return <PetaMap />;
}
```

## Performance Impact

- ✅ **No change**: All memoization & optimizations preserved
- ✅ **Same bundle size**: Just organized differently
- ✅ **Same rendering**: useMemo & useCallback still working
- ✅ **Instant filtering**: Still instant (0 lag)
- ✅ **83.416 points**: Still renders smoothly

## Future Enhancements

Dengan structure modular ini, mudah untuk:
- Add more filter types (status_penerimaan dropdown)
- Add export to CSV/GeoJSON
- Add clustering for zoomed-out views
- Add animation transitions
- Create variant components (compact mode, fullscreen mode)
- Write unit tests untuk setiap module
