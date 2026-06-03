# Deployment Guide

Project ini memakai static pipeline: data diproses di BigQuery, diekspor ke GCS sebagai Parquet, lalu website membaca file Parquet itu langsung dari browser.

## Environment

Set environment berikut di local dan deployment platform:

```env
VITE_DEPLOY_TYPE=remote
VITE_DATA_SOURCE_URL=https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet
```

## GCS CORS

Bucket GCS harus mengizinkan browser mengambil file Parquet:

```bash
echo '[{"origin": ["*"], "method": ["GET"], "responseHeader": ["Content-Type"], "maxAgeSeconds": 3600}]' > cors.json
gcloud storage buckets update gs://spmb-map-public --cors-file=cors.json
```

## BigQuery Scheduled Export

Contoh scheduled query:

```sql
EXPORT DATA OPTIONS(
  uri='gs://spmb-map-public/peta_murid_*.parquet',
  format='PARQUET',
  overwrite=true
) AS
SELECT * FROM `your_project.rpt.Pendaftaran_Looker_func1`();
```

Pastikan nama object final sesuai dengan `VITE_DATA_SOURCE_URL`:

```text
https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet
```

## Deploy Website

```bash
npm run build
```

Deploy folder `dist/` ke Vercel, Firebase Hosting, GCS static hosting, atau server static lain.

## Verify

Di browser Network tab, request data Geospatial harus menuju:

```text
https://storage.googleapis.com/spmb-map-public/peta_murid_000000000000.parquet
```

Tidak ada file Parquet yang perlu disimpan atau di-commit di repository ini.
