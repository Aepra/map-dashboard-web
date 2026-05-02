// duckdbEngine.js
// Global singleton for DuckDB WASM, connection, and data cache
import * as duckdb from '@duckdb/duckdb-wasm';
import { DUCKDB_CONFIG, PARQUET_URL, PARQUET_URL_GITHUB } from '../utils/constants';

const globalCache = {
  db: null,
  conn: null,
  data: null,
  initialized: false,
  schema: null,
  idColumn: null,
  jalurColumn: null,
  parquetSource: null,
  initPromise: null,
};

export async function initDuckDB() {
  if (globalCache.initialized && globalCache.data) return globalCache;
  if (globalCache.initPromise) return globalCache.initPromise;

  globalCache.initPromise = (async () => {
    const logger = new duckdb.ConsoleLogger();
    const _worker = new Worker(DUCKDB_CONFIG.mainWorker);
    const _db = new duckdb.AsyncDuckDB(logger, _worker);
    await _db.instantiate(DUCKDB_CONFIG.mainModule);
    globalCache.db = _db;
    globalCache.conn = await _db.connect();
    // Register parquet with robust fallback: local first, then GitHub.
    // This protects runtime from corrupt local files (invalid parquet footer/header).
    const parquetCandidates = [
      { alias: 'data_local.parquet', url: PARQUET_URL },
      { alias: 'data_remote.parquet', url: PARQUET_URL_GITHUB },
    ];

    let activeParquetAlias = null;
    let sampleResult = null;

    for (const candidate of parquetCandidates) {
      try {
        await _db.registerFileURL(candidate.alias, candidate.url, duckdb.DuckDBDataProtocol.HTTP, false);
        const probe = await globalCache.conn.query(`SELECT * FROM '${candidate.alias}' LIMIT 1`);
        activeParquetAlias = candidate.alias;
        sampleResult = probe;
        globalCache.parquetSource = candidate.url;
        break;
      } catch {
        // Try next source
      }
    }

    if (!activeParquetAlias) {
      throw new Error('Gagal memuat parquet dari local maupun GitHub source');
    }

    // Detect schema and columns
    const sampleRow = sampleResult.toArray()[0]?.toJSON() || {};
    const availableColumns = Object.keys(sampleRow);
    globalCache.schema = availableColumns;
    const lowerCols = availableColumns.map(c => c.toLowerCase());
    if (lowerCols.includes('pendaftaran_id')) globalCache.idColumn = availableColumns[lowerCols.indexOf('pendaftaran_id')];
    else if (lowerCols.includes('id')) globalCache.idColumn = availableColumns[lowerCols.indexOf('id')];
    else if (lowerCols.includes('id_peserta')) globalCache.idColumn = availableColumns[lowerCols.indexOf('id_peserta')];
    else if (lowerCols.includes('no_peserta')) globalCache.idColumn = availableColumns[lowerCols.indexOf('no_peserta')];
    else if (lowerCols.includes('peserta_id')) globalCache.idColumn = availableColumns[lowerCols.indexOf('peserta_id')];
    else if (lowerCols.includes('no_urut')) globalCache.idColumn = availableColumns[lowerCols.indexOf('no_urut')];
    else if (lowerCols.includes('nomor_peserta')) globalCache.idColumn = availableColumns[lowerCols.indexOf('nomor_peserta')];
    if (lowerCols.includes('jalur')) {
      globalCache.jalurColumn = availableColumns[lowerCols.indexOf('jalur')];
    } else {
      const jalurIdx = lowerCols.findIndex((c) => c.includes('jalur'));
      if (jalurIdx >= 0) globalCache.jalurColumn = availableColumns[jalurIdx];
    }
    // Query all data ONCE
    let selectClause = `CAST(lintang AS DOUBLE) as lintang,CAST(bujur AS DOUBLE) as bujur,CAST(jenjang AS VARCHAR) as jenjang,CAST(nama_sekolah_tujuan AS VARCHAR) as nama_sekolah_tujuan,CAST(status_penerimaan AS VARCHAR) as status_penerimaan`;
    if (globalCache.idColumn) selectClause += `,CAST(\"${globalCache.idColumn}\" AS VARCHAR) as id_peserta`;
    if (globalCache.jalurColumn) selectClause += `,CAST(\"${globalCache.jalurColumn}\" AS VARCHAR) as jalur`;
    else selectClause += `,CAST(NULL AS VARCHAR) as jalur`;
    const query = `SELECT ${selectClause} FROM '${activeParquetAlias}'`;
    const resultAll = await globalCache.conn.query(query);
    // Store as raw array of objects (no transformation in React)
    globalCache.data = resultAll.toArray().map(row => row.toJSON());
    globalCache.initialized = true;
    return globalCache;
  })();
  return globalCache.initPromise;
}

export function getCachedData() {
  return globalCache.data;
}

export function getSchema() {
  return globalCache.schema;
}

export function getIdColumn() {
  return globalCache.idColumn;
}

export function getJalurColumn() {
  return globalCache.jalurColumn;
}
