# Docker Guide

Docker menjalankan aplikasi Vite/React saja. Data Geospatial tidak disimpan di container dan tidak di-download ke `public/data`.

Sumber data dibaca langsung dari GCS melalui:

```env
VITE_DEPLOY_TYPE=remote
VITE_DATA_SOURCE_URL=https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet
```

## Docker Compose

```bash
docker-compose up --build
```

Aplikasi tersedia di:

```text
http://localhost:5173
```

## Manual Docker

```bash
docker build -t ppdb-dashboard .
docker run -p 5173:5173 --env-file .env ppdb-dashboard
```

## Data Flow

```text
BigQuery scheduled export
    ↓
GCS public Parquet object
    ↓
Browser + DuckDB WASM
    ↓
Deck.gl map
```

Tidak ada volume `public/data`, tidak ada script download, dan tidak ada koneksi ke GitHub untuk mengambil data Geospatial.
