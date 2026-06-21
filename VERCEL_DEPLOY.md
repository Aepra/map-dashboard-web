# Deploy ke Vercel — Langkah Demi Langkah

## 1. Push Semua Perubahan ke GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## 2. Import Project ke Vercel

1. Buka [vercel.com](https://vercel.com) → Login (pakai GitHub)
2. Klik **Add New** → **Project**
3. Pilih repo **map-dashboard-web**
4. **PASTIKAN** Framework Preset: **Vite** (auto detect)
5. **Build and Output Settings:**
   - Build Command: `npm run build`
   - Output Directory: `dist`

## 3. Environment Variables (WAJIB)

Di tab **Environment Variables**, tambahkan satu per satu:

| Key | Value |
|-----|-------|
| `VITE_DEPLOY_TYPE` | `vercel` |

> **Catatan:** Jika app menggunakan `data-config.json` di folder `public/`, URL parquet dan dashboard sudah dibaca dari situ — tidak perlu env variable terpisah.

Jika app membaca dari env (bukan dari `data-config.json`), tambahkan juga:

| Key | Value |
|-----|-------|
| `VITE_GEOSPATIAL_2025` | `https://storage.googleapis.com/spmb-map-public/peta_murid_2025.parquet` |
| `VITE_GEOSPATIAL_2026` | `https://storage.googleapis.com/spmb-map-public/peta_murid_2026.parquet` |
| `VITE_BERANDA_2026` | URL Looker Studio dashboard beranda |
| `VITE_BERANDA_2025` | URL Looker Studio dashboard beranda |
| `VITE_TK_2026` | URL Looker Studio TK |
| `VITE_TK_2025` | URL Looker Studio TK |
| `VITE_SD_2026` | URL Looker Studio SD |
| `VITE_SD_2025` | URL Looker Studio SD |
| `VITE_SMP_2026` | URL Looker Studio SMP |
| `VITE_SMP_2025` | URL Looker Studio SMP |
| `VITE_PENDAFTARAN_AKUN` | URL Looker Studio pendaftaran akun |
| `VITE_OUTLIER` | URL Looker Studio outlier |

Cara tahu mana yang diperlukan:
- Cek file `src/utils/envConfig.js` — semua variabel `VITE_GEOSPATIAL_2025` dll dibaca dari `import.meta.env`
- Buka file `.env` di local dan copy semua `VITE_*` keys + values

## 4. Deploy

Klik **Deploy**. Proses:
1. `npm ci` → install dependencies
2. `npm run build` → build production (output ke `dist/`)
3. Vercel upload file di `dist/` ke CDN

## 5. Jika "dist not found"

Jika Vercel bilang **"No Output Directory named 'dist' found"**:

1. Buka Project Settings → **Build & Development Settings**
2. Pastikan:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Redeploy

## 6. Jika UI berantakan / halaman kosong

1. **Environment variables kosong** → tambah semua `VITE_*` di Vercel dashboard (langkah 3)
2. **CORS GCS** → Bucket Google Cloud Storage harus izinkan domain Vercel
3. **Cache lama** → Redeploy: Vercel Dashboard → Deployments → ⋮ → Redeploy (uncheck "Use existing Build Cache")

## 7. Custom Domain (Opsional)

1. Project → Settings → Domains
2. Tambah domain (contoh: `ppdb.makassarkota.go.id`)
3. Update DNS sesuai instruksi Vercel

## File `vercel.json` Saat Ini

```json
{
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://superapps.makassarkota.go.id http://localhost:* http://127.0.0.1:*;"
        }
      ]
    },
    {
      "source": "/geospatial",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "frame-ancestors https://superapps.makassarkota.go.id http://localhost:* http://127.0.0.1:* https://lookerstudio.google.com https://datastudio.google.com https://*.looker.com;"
        }
      ]
    }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm ci"
}