# Map Dashboard Web

Dashboard untuk visualisasi data SPMB. Aplikasi ini menampilkan beberapa dashboard berbeda sesuai kebutuhan.

## Fitur

- Geospatial - Visualisasi peserta berdasarkan lokasi
- Demografi - Analisis data demografis peserta
- Registrasi - Monitor data pendaftaran
- Seragam Gratis - Program pemberian seragam
- Kebutuhan Khusus - Data peserta dengan kebutuhan khusus
- Query di browser - Menggunakan DuckDB
- Bisa di-embed ke website

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.2 | UI Framework |
| Vite | 8.0 | Build tool & dev server |
| React Router | 7.14 | Client-side routing |
| Tailwind CSS | 4.2 | Styling |
| Lucide React | 1.14 | Icon library |

### Data & Visualization
| Technology | Version | Purpose |
|-----------|---------|---------|
| Deck.gl | 9.3 | WebGL-based visualization |
| MapLibre GL | 5.24 | Map rendering |
| React Map GL | 8.1 | React wrapper untuk MapLibre |
| DuckDB Wasm | 1.33 | In-browser SQL engine |
| Apache Arrow | 20.0 | Columnar data format |

### Development
| Technology | Version | Purpose |
|-----------|---------|---------|
| ESLint | 10.2 | Code linting |
| PostCSS | 8.5 | CSS processing |
| Tailwind | 4.2 | Utility-first CSS |
| Node Cron | 4.2 | Task scheduling |

## Struktur Proyek

```
map-dashboard-web/
├── public/
│   ├── data/                          # Parquet files untuk DuckDB
│   └── duckdb-browser-mvp.worker.js   # DuckDB Worker
├── scripts/
│   ├── startup.js                     # Development startup
│   ├── downloadParquet.js             # Download data files
│   └── dataService.js                 # Auto-update service
├── src/
│   ├── main.jsx                       # React entry point
│   ├── App.jsx                        # Root router component
│   ├── index.css                      # Global styles
│   ├── App.css                        # App styles
│   ├── assets/
│   │   ├── icons/                     # Icon assets
│   │   └── images/                    # Image assets
│   ├── components/
│   │   ├── DashboardHeader.jsx        # Header component
│   │   ├── Sidebar.jsx                # Navigation sidebar
│   │   ├── EmbedItem.jsx              # Embed card component
│   │   ├── FloatingRestartButton.jsx  # Restart button
│   │   └── DashboardLoadingOverlay.jsx
│   └── pages/
│       ├── Geospatial/
│       │   ├── index.jsx              # Main geospatial page
│       │   ├── components/            # Geospatial-specific UI
│       │   │   ├── GeospatialMap.jsx
│       │   │   ├── ControlPanel.jsx
│       │   │   ├── InfoPanel.jsx
│       │   │   └── ...
│       │   ├── hooks/                 # Custom React hooks
│       │   │   ├── useDuckDBData.js
│       │   │   ├── useFilteredData.js
│       │   │   ├── duckdbSingleton.js
│       │   │   └── ...
│       │   └── utils/
│       │       ├── constants.js
│       │       ├── createLayer.js
│       │       └── schoolColors.js
│       ├── Demografi/
│       ├── Registrasi/
│       ├── SeragamGratis/
│       └── BerkebutuhanKhusus/
├── .eslintrc.js                       # ESLint config
├── vite.config.js                     # Vite config
├── tailwind.config.js                 # Tailwind config
├── package.json
├── Dockerfile                         # Docker build
├── docker-compose.yml
├── DEPLOY.md                          # Deployment guide
├── DOCKER.md                          # Docker guide
└── README.md

```

## Mulai Cepat

### Prerequisites
- Node.js: ≥ 18.x
- npm: ≥ 9.x atau yarn / pnpm
- Git

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd map-dashboard-web
```

2. Install dependencies
```bash
npm install
```

3. Download data files (opsional, jika ingin data terbaru)
```bash
npm run download-data
```

4. Start development server
```bash
npm run dev
```

Aplikasi akan tersedia di http://localhost:5173

## Penggunaan

### Development Mode
```bash
# Start dengan data download service & auto-update
npm run dev

# Start hanya Vite dev server (tanpa service)
npm run dev:vite
```

### Production Build
```bash
# Build untuk production
npm run build

# Preview production build locally
npm run preview
```

### Data Management
```bash
# Download/update Parquet files dari source
npm run download-data

# Start background service untuk auto-update data
npm run service:download
```

### Code Quality
```bash
# Lint code
npm run lint

# Lint dengan fix
npm run lint -- --fix
```

## Arsitektur

### Data Flow

```
User Browser
    ↓
React Router (5 Dashboards)
    ↓
├─ Geospatial Page → GeospatialMap (Deck.gl + MapLibre)
├─ Demografi Page → Chart Components
├─ Registrasi Page → Table Components
├─ Seragam Page → Distribution Components
└─ Khusus Page → Analysis Components
    ↓
Custom Hooks (useFilteredData, useDuckDBData, etc)
    ↓
DuckDB Wasm (In-Browser SQL Engine)
    ↓
Parquet Files (public/data/*.parquet)
```

### Key Components

#### Geospatial Dashboard
- GeospatialMap: Renderer utama menggunakan Deck.gl dan MapLibre GL
- ControlPanel: Filter interaktif untuk data peserta
- SchoolSearchPanel: Search functionality untuk sekolah
- InfoPanel: Detail informasi peserta terpilih
- Hooks: Custom hooks untuk DuckDB queries dan data filtering

#### State Management
Menggunakan React Hooks untuk state management:
- useDuckDBData - Query dan cache data dari DuckDB
- useFilteredData - Filter dan sort data berdasarkan kriteria
- useFilterMetrics - Hitung metrics agregat
- useSchoolData - Manage school-specific data

#### Data Persistence
- Parquet Format: Efficient columnar data storage
- DuckDB Wasm: SQL queries langsung di browser tanpa network round-trip
- Apache Arrow: Zero-copy data interoperability

## Docker Deployment

### Build Docker Image
```bash
docker build -t map-dashboard-web .
```

### Run dengan Docker Compose
```bash
docker-compose up -d
```

Lihat [DOCKER.md](./DOCKER.md) untuk detail lebih lanjut.

## API Scripts

### downloadParquet.js
Download Parquet files dari remote source dan simpan ke `public/data/`

```bash
node scripts/downloadParquet.js
```

### dataService.js
Background service dengan cron scheduler untuk auto-update data

```bash
node scripts/dataService.js
```

### startup.js
Development startup script yang menjalankan Vite + data service

```bash
node scripts/startup.js
```

## Konfigurasi

### Vite Configuration
File: `vite.config.js`
- React plugin dengan Fast Refresh
- ESLint plugin
- Optimasi build

### Tailwind Configuration
File: `tailwind.config.js`
- Custom theme colors
- Extended utilities

### ESLint Configuration
File: `.eslintrc.js`
- React recommended rules
- React Hooks linting

## Environment Variables

Buat file `.env.local` untuk environment-specific variables:

```env
# Map API Keys
VITE_MAPLIBRE_API_KEY=your_key_here
VITE_MAP_STYLE_URL=your_style_url

# Data Source
VITE_DATA_SOURCE_URL=https://your-data-source.com/data

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_AUTO_UPDATE=true
```

## Deployment

### Vercel
Proyek sudah konfigurasi untuk Vercel (file: `vercel.json`)

```bash
vercel deploy
```

### Self-hosted
```bash
npm run build
# Serve dist/ folder dengan web server (nginx, apache, dll)
```

Lihat [DEPLOY.md](./DEPLOY.md) untuk detail lengkap.

## Performance

### Optimizations
- Code splitting dengan React Router
- Lazy loading untuk dashboard pages
- DuckDB untuk efficient data querying
- Deck.gl untuk performant WebGL rendering
- Tailwind CSS untuk minimal CSS output

### Metrics
- Initial Load: < 2s
- Time to Interactive: < 3s
- Dashboard Load: < 1s (with cached data)

## Troubleshooting

### DuckDB Load Issues
```bash
# Pastikan worker file sudah tersedia
# Lokasi: public/duckdb-browser-mvp.worker.js
```

### Data Parquet Error
```bash
# Download ulang data files
npm run download-data
```

### Port Already in Use
```bash
# Start di port berbeda
npm run dev -- --port 3000
```

## Documentation

- [Docker Guide](./DOCKER.md) - Containerization dan deployment
- [Deployment Guide](./DEPLOY.md) - Production deployment
- [Vite Docs](https://vitejs.dev)
- [React Docs](https://react.dev)
- [Deck.gl Docs](https://deck.gl)
- [DuckDB Docs](https://duckdb.org)

## Contributing

Kontribusi sangat diterima! Berikut langkahnya:

1. Fork repository
2. Buat branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Standards
- Follow ESLint rules
- Write meaningful commit messages
- Test sebelum submit PR
- Update documentation

## License

Project ini dilisensikan di bawah [MIT License](./LICENSE).

## Author

**Map System Team**
- Website: [your-website.com](https://your-website.com)
- Email: team@mapsystem.com

## Acknowledgments

- [Vite](https://vitejs.dev) - Next generation frontend tooling
- [React](https://react.dev) - A JavaScript library for building user interfaces
- [Deck.gl](https://deck.gl) - WebGL-powered visualization framework
- [DuckDB](https://duckdb.org) - In-process SQL OLAP database
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS framework

---

**Last Updated**: May 2026  
**Status**: Production Ready
