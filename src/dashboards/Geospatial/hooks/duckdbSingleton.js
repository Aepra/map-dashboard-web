// duckdbSingleton.js
// Singleton for DuckDB WASM instance and connection
import * as duckdb from '@duckdb/duckdb-wasm';
import { DUCKDB_CONFIG } from '../utils/constants';

// Global cache (module scope)
let dbInstance = null;
let dbConnection = null;
let parquetRegistered = false;
let dbInitPromise = null;

export async function getDuckDBConnection() {
  if (dbConnection) return dbConnection;
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = (async () => {
    // Only initialize once
    const logger = new duckdb.ConsoleLogger();
    const _worker = new Worker(DUCKDB_CONFIG.mainWorker);
    const _db = new duckdb.AsyncDuckDB(logger, _worker);
    await _db.instantiate(DUCKDB_CONFIG.mainModule);
    dbInstance = _db;
    dbConnection = await _db.connect();
    return dbConnection;
  })();

  return dbInitPromise;
}

export async function registerParquetIfNeeded() {
  if (parquetRegistered) return;
  await getDuckDBConnection();

  const localPath = '/data/peta_murid.parquet';
  await dbInstance.registerFileURL(
    'data.parquet',
    localPath,
    duckdb.DuckDBDataProtocol.HTTP,
    false
  );
  parquetRegistered = true;
}

export function resetDuckDBCache() {
  // For manual reloads (if needed)
  dbConnection = null;
  dbInstance = null;
  parquetRegistered = false;
  dbInitPromise = null;
}
