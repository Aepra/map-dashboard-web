# 🗺️ PPDB Makassar Dashboard

Interactive map dashboard visualization untuk data pendaftaran PPDB Makassar (83,416 siswa).

## ✨ Features

- **📍 Real-time Map** - 83,416 data points dengan Deck.gl + MapLibre
- **🎨 Color-coded Jenjang** - 🔴 SD | 🔵 SMP | 🟡 PAUD
- **🔍 Advanced Filters** - Multi-select by education level
- **📊 Live Statistics** - Real-time data breakdown
- **⚡ Zero Lag** - Optimized performance dengan DuckDB
- **🔄 Auto-update** - Download data setiap 1 jam
- **🐳 Docker Ready** - One command to run everything

## 🚀 Quick Start dengan Docker

### Prerequisites
- Docker
- Docker Compose

### Run dengan Docker Compose (Recommended)

```bash
docker-compose up
```

Akses aplikasi di: **http://localhost:5176**

Pertama kali jalankan, akan:
1. ✅ Download data parquet (6.45 MB)
2. ✅ Setup hourly auto-update service
3. ✅ Start dev server
4. ✅ Map siap menampilkan 83,416 data points

### Build Manual

```bash
docker build -t ppdb-dashboard .
docker run -p 5176:5176 -v $(pwd)/public/data:/app/public/data ppdb-dashboard
```

## 💻 Local Development (tanpa Docker)

```bash
npm install --legacy-peer-deps
npm run dev
```

Akan otomatis:
1. Download data ke `public/data/peta_murid.parquet`
2. Start hourly background service
3. Run Vite dev server

## 📁 Project Structure

```
map-dashboard-web/
├── public/
│   └── data/
│       └── peta_murid.parquet    ← Local data cache
├── src/
│   ├── components/
│   │   └── PetaMap/
│   │       ├── PetaMap.jsx       ← Main component
│   │       ├── ControlPanel.jsx  ← Filter UI
│   │       ├── StatsPanel.jsx    ← Statistics
│   │       ├── useDuckDBData.js  ← Data loading
│   │       ├── useFilteredData.js← Filtering
│   │       ├── createLayer.js    ← Map layer
│   │       └── constants.js      ← Config
│   └── App.jsx
├── scripts/
│   ├── startup.js                ← Orchestrates startup
│   ├── downloadParquet.js        ← Download script
│   └── dataService.js            ← Hourly update service
├── Dockerfile
└── docker-compose.yml
```

## 🔧 Configuration

### Parquet Data Source
- **Local**: `/data/peta_murid.parquet` (prioritas utama)
- **Fallback**: GitHub raw URL

### Auto-update Schedule
- **Setiap**: 1 jam (00 menit setiap jam)
- **Log**: `public/data/download.log`

### Map Configuration
- **Base Map**: CartoDB Positron
- **Zoom Range**: 3 - 20
- **Tile Provider**: CARTO

## 📊 Data Format

```
Columns:
- lintang (latitude)
- bujur (longitude)
- jenjang (SD/SMP/PAUD)
- nama_sekolah_tujuan (school name)
- status_penerimaan (acceptance status)

Total Records: 83,416
- SD: 41,556
- SMP: 41,197
- PAUD: 661
```

## 🎯 Performance

- **Load Time**: < 15 detik (first load with download)
- **Render**: 60 FPS dengan 83K points
- **Filter**: Instant (< 100ms)
- **Zoom**: Smooth & responsive

## 🔄 CI/CD Integration

Data otomatis diupdate setiap 1 jam via background service. Untuk production, integrasikan dengan GitHub Actions:

```yaml
# .github/workflows/update-data.yml
schedule:
  - cron: '0 * * * *'  # Every hour
```

## 🐛 Troubleshooting

### Map tidak menampilkan data
```bash
# Check if parquet file exists
docker exec ppdb-dashboard ls -lh /app/public/data/

# View download logs
docker exec ppdb-dashboard tail -f /app/public/data/download.log
```

### Port 5176 sudah terpakai
```bash
# Run di port berbeda
docker run -p 5180:5176 ppdb-dashboard
```

### Memory issue
```bash
# Increase Docker memory allocation
docker-compose up --memory=2g
```

## 📝 License

MIT

## 👨‍💻 Developer

Built with ❤️ for PPDB Makassar
