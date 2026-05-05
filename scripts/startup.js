#!/usr/bin/env node
import { execSync, spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { platform } from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isWindows = platform() === 'win32';
const DEV_PORT = 5173;
const DEV_DIST_DIR = '.next-dev';

const freePort = (port) => {
  try {
    if (isWindows) {
      const output = execSync(`netstat -ano -p tcp | findstr :${port}`, {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      });
      const pids = [...new Set(
        output
          .split(/\r?\n/)
          .map((line) => line.trim().split(/\s+/).pop())
          .filter((value) => /^\d+$/.test(value))
      )];

      for (const pid of pids) {
        try {
          execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
          console.log(`🧹 Stopped process on port ${port} (PID ${pid})`);
        } catch {
          // ignore failures; the process may have exited already
        }
      }
      return;
    }

    const output = execSync(`lsof -ti tcp:${port}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (!output) return;

    const pids = [...new Set(output.split(/\r?\n/).filter((value) => /^\d+$/.test(value)))];
    for (const pid of pids) {
      try {
        process.kill(Number(pid), 'SIGKILL');
        console.log(`🧹 Stopped process on port ${port} (PID ${pid})`);
      } catch {
        // ignore failures; the process may have exited already
      }
    }
  } catch {
    // Port is free or the lookup tool is unavailable.
  }
};

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

freePort(DEV_PORT);

const nextCachePath = `${dirname(__dirname)}/${DEV_DIST_DIR}`;

if (fs.existsSync(nextCachePath)) {
  console.log('🧹 Clearing stale Next.js cache...');
  fs.rmSync(nextCachePath, { recursive: true, force: true });
  console.log('✅ Cache cleared\n');
}

// Step 1: Download parquet file first
const parquetPath = `${dirname(__dirname)}/public/data/peta_murid.parquet`;

const startDevServer = () => {
  // Step 2: Start background service (hourly download)
  console.log('⏰ Starting hourly auto-download service...');
  const service = spawn(process.execPath, ['scripts/dataService.js'], {
    cwd: dirname(__dirname),
    detached: true,
    stdio: 'ignore',
    shell: false,
  });
  service.unref();
  console.log('✅ Service started (running in background)\n');

  // Step 3: Start dev server
  console.log('🔨 Starting Next.js dev server...\n');
  const devCommand = isWindows ? 'cmd.exe' : 'npx';
  const devArgs = isWindows
    ? ['/c', 'npx', 'next', 'dev', '-H', '0.0.0.0', '-p', String(DEV_PORT)]
    : ['next', 'dev', '-H', '0.0.0.0', '-p', String(DEV_PORT)];

  const dev = spawn(devCommand, devArgs, {
    cwd: dirname(__dirname),
    env: {
      ...process.env,
      NEXT_DIST_DIR: DEV_DIST_DIR,
    },
    stdio: 'inherit',
    shell: false,
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
  const download = spawn(process.execPath, ['scripts/downloadParquet.js'], {
    cwd: dirname(__dirname),
    stdio: 'inherit',
    shell: false,
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
