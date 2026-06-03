# Map Dashboard Web

Dashboard React untuk visualisasi data SPMB, termasuk Geospatial, Demografi, Registrasi, Seragam Gratis, dan Kebutuhan Khusus.

## Data Geospatial

Data Geospatial tidak disimpan di repository ini.

Sumber data dibaca langsung dari public GCS Parquet URL:

```env
VITE_DEPLOY_TYPE=remote
VITE_DATA_SOURCE_URL=https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet
```

Di browser, aplikasi memakai DuckDB WASM untuk membaca file Parquet remote tersebut dan memetakan kolom ke format yang dipakai layer Geospatial.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React + Vite | Frontend app |
| Deck.gl | WebGL visualization |
| MapLibre GL | Map rendering |
| DuckDB WASM | Membaca/query Parquet dari browser |
| Apache Arrow | Format data columnar |
| Tailwind CSS | Styling |

## Struktur Utama

```text
map-dashboard-web/
├── public/
│   └── duckdb-browser-mvp.worker.js
├── scripts/
│   └── startup.js
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── pages/
│       └── Geospatial/
│           ├── components/
│           ├── hooks/
│           │   ├── duckdbEngine.js
│           │   └── useDuckDBData.js
│           └── utils/
│               └── constants.js
├── .env.example
├── package.json
└── vite.config.js
```

## Setup

```bash
npm install
npm run dev
```

Aplikasi tersedia di `http://localhost:5173`.

## Scripts

```bash
npm run dev
npm run dev:vite
npm run build
npm run preview
npm run lint
```

Tidak ada script download data. File Parquet berada di GCS dan dibaca langsung oleh Geospatial dashboard.

## Static Pipeline

Arsitektur data:

```text
BigQuery Scheduled Query
    ↓ EXPORT DATA format PARQUET
Google Cloud Storage public object
    ↓ browser GET request
DuckDB WASM read_parquet/registerFileURL
    ↓
Deck.gl + MapLibre Geospatial view
```

Pastikan bucket GCS mengizinkan akses browser:

```bash
echo '[{"origin": ["*"], "method": ["GET"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json
gcloud storage buckets update gs://spmb-map-public --cors-file=cors.json
```

## Troubleshooting

Jika data Geospatial tidak muncul:

- Pastikan `VITE_DATA_SOURCE_URL` mengarah ke object GCS yang benar.
- Pastikan object GCS public atau bisa diakses browser.
- Pastikan CORS bucket mengizinkan request `GET`.
- Cek browser Network tab untuk request ke `https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet`.
