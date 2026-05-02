# 🚀 Deployment Guide

## Setup Deployment Type

Choose one deployment method:

### **Option 1: Vercel (Cloud - Recommended for easy setup)**

**Setup:**

1. **Update .env file:**
```bash
VITE_DEPLOY_TYPE=vercel
```

2. **Commit parquet data to git:**
```bash
git add -f public/data/peta_murid.parquet
git add .
git commit -m "Prepare for Vercel deployment - include parquet data"
git push
```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Connect GitHub repository
   - Click "Deploy"
   - Environment variables already configured via .env

**Result:** App + Data both served from Vercel CDN ✅

---

### **Option 2: Self-Hosted Docker (Private - Better for sensitive data)**

**Setup:**

1. **Update .env file:**
```bash
VITE_DEPLOY_TYPE=self
VITE_DATA_SOURCE_URL=https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet
```

2. **Keep parquet out of git (data downloads at runtime):**
```bash
# DON'T commit parquet file
# .gitignore already configured
```

3. **Push to git:**
```bash
git add .
git commit -m "Setup for self-hosted Docker deployment"
git push
```

4. **Deploy to your server:**

   **Docker Compose:**
   ```bash
   docker-compose up --build
   ```

   **Manual Docker:**
   ```bash
   docker build -t map-dashboard .
   docker run -p 5173:5173 map-dashboard
   ```

**Result:** Data downloads from GitHub at runtime, never stored in repo ✅

---

## Environment Variables

| Variable | Options | Description |
|----------|---------|-------------|
| `VITE_DEPLOY_TYPE` | `vercel` or `self` | Deployment type |
| `VITE_DATA_SOURCE_URL` | URL string | Data source URL (for self-hosted) |

**Default:**
- `VITE_DEPLOY_TYPE=vercel` (fallback)
- `VITE_DATA_SOURCE_URL=https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet`

---

## Quick Deploy Commands

### For Vercel:
```bash
# Prepare
git add -f public/data/peta_murid.parquet
git add .
git commit -m "Deploy: Vercel"
git push

# Then go to vercel.com and click deploy
```

### For Self-Hosted:
```bash
# Prepare
git add .
git commit -m "Deploy: Self-hosted"
git push

# Deploy
docker-compose up --build
```

---

## Verify Deployment Type

Check console or network tab:
- **Vercel:** Data loaded from `/data/peta_murid.parquet`
- **Self:** Data loaded from GitHub raw URL (network request visible)

---

## Troubleshooting

**Data not loading?**
- Check environment variables are set
- Check `.env` file exists in deployment environment
- For Vercel: add env vars in Vercel Settings
- For Docker: env vars pass via docker-compose or docker run -e

**Parquet file missing?**
- Vercel: Make sure `public/data/peta_murid.parquet` committed to git
- Self: Make sure GitHub data URL is accessible

---

**Ready to deploy? Choose option above and run the commands!** 🎯
