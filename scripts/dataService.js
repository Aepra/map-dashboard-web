#!/usr/bin/env node

/**
 * Background Data Download Service
 * Automatically downloads Parquet file setiap 1 jam dari GitHub
 * 
 * Usage: npm run service:download
 * atau: node scripts/dataService.js
 */

import cron from 'node-cron';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_URL = 'https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet';
const OUTPUT_PATH = path.join(__dirname, '../public/data/peta_murid.parquet');
const LOG_FILE = path.join(__dirname, '../public/data/download.log');

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

const isValidParquetFile = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return false;
    const stats = fs.statSync(filePath);
    if (stats.size < 8) return false;

    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(4);
    const footer = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);
    fs.readSync(fd, footer, 0, 4, stats.size - 4);
    fs.closeSync(fd);

    return header.toString('utf8') === 'PAR1' && footer.toString('utf8') === 'PAR1';
  } catch {
    return false;
  }
};

/**
 * Utility untuk mencatat waktu download
 */
const logDownload = (message) => {
  const timestamp = new Date().toLocaleString('id-ID');
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  
  // Append ke log file
  fs.appendFileSync(LOG_FILE, logMessage + '\n', (err) => {
    if (err) console.error('Error writing log:', err);
  });
};

/**
 * Download file dari GitHub
 */
const downloadFile = () => {
  return new Promise((resolve, reject) => {
    https.get(GITHUB_URL, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(OUTPUT_PATH);

      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        const sizeMB = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
        logDownload(`✅ Download success - Size: ${sizeMB} MB`);
        resolve(sizeMB);
      });

      fileStream.on('error', (err) => {
        fs.unlink(OUTPUT_PATH, () => {});
        reject(err);
      });
    }).on('error', reject);
  });
};

/**
 * Main Service - Schedule downloads
 */
const startService = () => {
  logDownload('🚀 Data Download Service Started');
  logDownload(`📍 Source: ${GITHUB_URL}`);
  logDownload(`💾 Destination: public/data/peta_murid.parquet`);
  logDownload('⏰ Schedule: Every 1 hour (at minute 0)');
  logDownload('---');

  // Download immediately on startup only when cache is missing
  if (isValidParquetFile(OUTPUT_PATH)) {
    logDownload('✅ Existing parquet cache valid, skipping initial download');
  } else {
    logDownload('⚠️ Existing parquet cache missing/corrupt, downloading fresh file');
    console.log('\n📥 Downloading initial data...');
    downloadFile()
      .then((size) => {
        console.log(`✅ Initial download complete (${size} MB)\n`);
      })
      .catch((err) => {
        logDownload(`❌ Initial download failed: ${err.message}`);
      });
  }

  // Schedule untuk setiap 1 jam (jam 0, menit 0)
  // "0 * * * *" = every hour
  const task = cron.schedule('0 * * * *', () => {
    logDownload('⏳ Scheduled download started...');
    downloadFile()
      .then((size) => {
        logDownload(`✅ Scheduled download success - Size: ${size} MB`);
      })
      .catch((err) => {
        logDownload(`❌ Scheduled download failed: ${err.message}`);
      });
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    logDownload('🛑 Service stopped by user');
    task.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logDownload('🛑 Service terminated');
    task.stop();
    process.exit(0);
  });

  console.log('✅ Service running. Press Ctrl+C to stop.\n');
};

// Start service
startService();

export { downloadFile };
