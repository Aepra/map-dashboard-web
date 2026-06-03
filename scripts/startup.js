#!/usr/bin/env node
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { platform } from 'os';

const __filename = fileURLToPath(import.meta.url);
const projectRoot = dirname(dirname(__filename));
const isWindows = platform() === 'win32';

console.log('PPDB Dashboard Startup...');
console.log('Geospatial data source: VITE_DATA_SOURCE_URL');
console.log('Starting Vite dev server...\n');

const devCommand = isWindows ? 'npx vite' : 'vite';
const dev = spawn(devCommand, ['--host', '0.0.0.0'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: isWindows,
});

process.on('SIGINT', () => {
  console.log('\nShutting down...');
  dev.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down...');
  dev.kill();
  process.exit(0);
});
