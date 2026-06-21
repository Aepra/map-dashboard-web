# Deploy ke Vercel

## 1. Push ke GitHub

Pastikan semua perubahan sudah di-push ke repository GitHub:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 2. Import Project ke Vercel

1. Buka [vercel.com](https://vercel.com) dan login
2. Klik **Add New** → **Project**
3. Pilih repository **map-dashboard-web**
4. Vercel akan otomatis mendeteksi Vite project. Biarkan konfigurasi default:
   - Framework Preset: **Vite**
   - Build Command: `npm run build` (sudah ada di vercel.json)
   - Output Directory: `dist` (sudah ada di vercel.json)

## 3. Set Environment Variables

Di halaman konfigurasi project Vercel, buka tab **Environment Variables** dan tambahkan semua variable berikut:

| Key | Value |
|-----|-------|
| `VITE_DEPLOY_TYPE` | `vercel` |
| `VITE_REGISTRASI_ID` | `https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_08ablbx93d` |
| `VITE_REGISTRASI_NIK` | `https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_uggv8bud4d` |
| `VITE_GEOSPATIAL_2025` | `https://storage.googleapis.com/spmb-map-public/peta_murid_2025.parquet` |
| `VITE_PAUD_2025` | `https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_bnrovuf03d` |
| `VITE_SD_2025` | `https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_v9ltlgi03d` |
| `VITE_SMP_2025` | `https://datastudio.google.com/embed/reporting/6481b956-06ca-410a-ae4e-ed8d373cc994/page/p_hupuqgi03d` |
| `VITE_PENDAFTARAN_AKUN` | `https://datastudio.google.com/embed/reporting/efcbc922-160a-47c7-8436-62ac9ffe12bc/page/p_51xqv9f82d` |
| `VITE_OUTLIER` | `https://datastudio.google.com/embed/reporting/efcbc922-160a-47c7-8436-62ac9ffe12bc/page/p_51xqv9f82d` |
| `VITE_GEOSPATIAL_2026` | `https://storage.googleapis.com/spmb-map-public/peta_murid_2026.parquet` |

> **Penting**: Environment variables dengan prefix `VITE_` akan di-inline saat build time. Setiap kali ada perubahan value, project harus di-redeploy.

## 4. Deploy

Klik **Deploy**. Vercel akan:
- Menjalankan `npm ci` (install dependencies)
- Menjalankan `npm run build` (build production)
- Deploy folder `dist/` ke CDN global

## 5. Custom Domain (Opsional)

Untuk menambahkan custom domain:
1. Buka project di Vercel dashboard
2. Tab **Settings** → **Domains**
3. Tambahkan domain yang diinginkan (contoh: `ppdb.makassarkota.go.id`)
4. Update DNS record sesuai instruksi Vercel

## Konfigurasi yang Sudah Ada

`vercel.json` sudah mencakup:
- **SPA Rewrites**: Semua route diarahkan ke `index.html` (untuk React Router)
- **CSP Headers**: Frame ancestors diizinkan untuk SuperApps Makassar, Looker Studio, dan localhost
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`