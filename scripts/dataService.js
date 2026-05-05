#!/usr/bin/env node

/**
 * Background Data Download Service
 * Automatically syncs Parquet file from Microsoft SQL Server every 4 hours
 * 
 * Usage: npm run service:download
 * atau: node scripts/dataService.js
 */

import cron from 'node-cron';
import { isValidParquetFile, logDownload, syncMicrosoftDataToParquet, OUTPUT_PATH } from './microsoftParquet.js';

/**
 * Main Service - Schedule downloads
 */
const startService = () => {
  logDownload('🚀 Data Download Service Started');
  logDownload('📍 Source: Microsoft SQL Server');
  logDownload(`💾 Destination: public/data/peta_murid.parquet`);
  logDownload('⏰ Schedule: Every 4 hours (at minute 0)');
  logDownload('---');

  // Sync immediately on startup only when cache is missing
  if (isValidParquetFile(OUTPUT_PATH)) {
    logDownload('✅ Existing parquet cache valid, skipping initial download');
  } else {
    logDownload('⚠️ Existing parquet cache missing/corrupt, syncing fresh file');
    console.log('\n📥 Syncing initial data...');
    syncMicrosoftDataToParquet()
      .then((rowCount) => {
        console.log(`✅ Initial sync complete (${rowCount} rows)\n`);
      })
      .catch((err) => {
        logDownload(`❌ Initial sync failed: ${err.message}`);
      });
  }

  // Schedule untuk setiap 4 jam
  const task = cron.schedule('0 */4 * * *', () => {
    logDownload('⏳ Scheduled sync started...');
    syncMicrosoftDataToParquet()
      .then((rowCount) => {
        logDownload(`✅ Scheduled sync success - Rows: ${rowCount}`);
      })
      .catch((err) => {
        logDownload(`❌ Scheduled sync failed: ${err.message}`);
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

