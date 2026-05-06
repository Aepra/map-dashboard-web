#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { platform } from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isWindows = platform() === 'win32';

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

console.log('🚀 PPDB Dashboard Startup...\n');

// Step 1: Download parquet file first
const parquetPath = `${dirname(__dirname)}/public/data/peta_murid.parquet`;

const startDevServer = () => {
  // Step 2: Start background service (hourly download)
  console.log('⏰ Starting hourly auto-download service...');
  const service = spawn('node', ['scripts/dataService.js'], {
    cwd: dirname(__dirname),
    detached: true,
    stdio: 'ignore',
    shell: isWindows,
  });
  service.unref();
  console.log('✅ Service started (running in background)\n');

  // Step 3: Start dev server
  console.log('🔨 Starting Vite dev server...\n');
  const devCommand = isWindows ? 'npx vite' : 'vite';
  const dev = spawn(devCommand, ['--host', '0.0.0.0'], {
    cwd: dirname(__dirname),
    stdio: 'inherit',
    shell: isWindows,
  });

  // Handle termination
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down...');
    dev.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n\n🛑 Shutting down...');
    dev.kill();
    process.exit(0);
  });
};

if (isValidParquetFile(parquetPath)) {
  console.log('✅ Parquet file valid, skipping download.\n');
  startDevServer();
} else {
  console.log('📥 Parquet missing/corrupt, downloading fresh file...');
  const download = spawn('node', ['scripts/downloadParquet.js'], {
    cwd: dirname(__dirname),
    stdio: 'inherit',
    shell: isWindows,
  });

  download.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Download failed');
      process.exit(1);
    }

    if (!isValidParquetFile(parquetPath)) {
      console.error('❌ Downloaded parquet invalid (magic bytes check failed)');
      process.exit(1);
    }

    console.log('\n✅ Download complete!\n');
    startDevServer();
  });
}
