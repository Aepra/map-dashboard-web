#!/usr/bin/env node
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isWindows = platform() === 'win32';

console.log('🚀 PPDB Dashboard Startup...\n');

// Step 1: Download parquet file first
console.log('📥 Downloading parquet file...');
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

  console.log('\n✅ Download complete!\n');

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
  const dev = spawn(devCommand, [], {
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
});
