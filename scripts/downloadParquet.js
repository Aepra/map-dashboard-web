#!/usr/bin/env node

/**
 * Download Parquet File Script
 * Usage: npm run download-data
 * 
 * Syncs peta_murid.parquet from Microsoft SQL Server and saves it to public/data/
 */

import { OUTPUT_PATH, syncMicrosoftDataToParquet } from './microsoftParquet.js';

console.log('📥 Syncing Parquet file from Microsoft SQL Server...');
console.log(`💾 Saving to: ${OUTPUT_PATH}\n`);

syncMicrosoftDataToParquet()
  .then((rowCount) => {
    console.log(`\n✅ Sync complete!`);
    console.log(`📦 Rows written: ${rowCount}`);
    console.log(`📂 Location: public/data/peta_murid.parquet\n`);
  })
  .catch((err) => {
    console.error('\n❌ Sync error:', err.message);
    process.exit(1);
  });
