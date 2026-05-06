#!/usr/bin/env node

/**
 * Download Parquet File Script
 * Usage: npm run download-data
 * 
 * Downloads peta_murid.parquet dari GitHub dan menyimpannya ke public/data/
 */

import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GITHUB_URL = 'https://raw.githubusercontent.com/Aepra/map-data-pipeline/main/data/peta_murid.parquet';
const OUTPUT_PATH = path.join(__dirname, '../public/data/peta_murid.parquet');

fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

console.log('📥 Downloading Parquet file from GitHub...');
console.log(`📍 URL: ${GITHUB_URL}`);
console.log(`💾 Saving to: ${OUTPUT_PATH}\n`);

https.get(GITHUB_URL, (response) => {
  if (response.statusCode !== 200) {
    console.error(`❌ Error: HTTP ${response.statusCode}`);
    process.exit(1);
  }

  const fileStream = fs.createWriteStream(OUTPUT_PATH);
  let downloadedBytes = 0;

  response.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    const mb = (downloadedBytes / 1024 / 1024).toFixed(2);
    process.stdout.write(`\r⬇️  Downloaded: ${mb} MB`);
  });

  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    const sizeMB = (fs.statSync(OUTPUT_PATH).size / 1024 / 1024).toFixed(2);
    console.log(`\n\n✅ Download complete!`);
    console.log(`📦 File size: ${sizeMB} MB`);
    console.log(`📂 Location: public/data/peta_murid.parquet\n`);
  });

  fileStream.on('error', (err) => {
    fs.unlink(OUTPUT_PATH, () => {}); // Delete on error
    console.error('\n❌ Error saving file:', err.message);
    process.exit(1);
  });
}).on('error', (err) => {
  console.error('❌ Download error:', err.message);
  process.exit(1);
});
