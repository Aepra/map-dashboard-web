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

    // Detect schema and columns (with flexible name mapping)
    const sampleRow = sampleResult.toArray()[0]?.toJSON() || {};
    const availableColumns = Object.keys(sampleRow || {});
    globalCache.schema = availableColumns;
    const lowerCols = availableColumns.map((c) => String(c).toLowerCase());

    const findCol = (candidates) => {
      for (const cand of candidates) {
        const idx = lowerCols.indexOf(cand);
        if (idx >= 0) return availableColumns[idx];
      }
      // fallback: find substring match
      for (const cand of candidates) {
        const idx = lowerCols.findIndex((c) => c.includes(cand));
        if (idx >= 0) return availableColumns[idx];
      }
      return null;
    };

    // Common alternative names
    const latCol = findCol(['lintang', 'latitude', 'lat', 'y']);
    const lonCol = findCol(['bujur', 'longitude', 'long', 'lon', 'lng', 'x']);
    const schoolLatCol = findCol(['lintang_sekolah', 'latitude_sekolah', 'lat_sekolah', 'school_lat']);
    const schoolLonCol = findCol(['bujur_sekolah', 'longitude_sekolah', 'lon_sekolah', 'lng_sekolah', 'school_lon']);
    const jenjangCol = findCol(['jenjang', 'grade', 'level']);
    const namaSekolahCol = findCol(['nama_sekolah_tujuan', 'nama_sekolah', 'school_name', 'sekolah']);
    const statusCol = findCol(['status_penerimaan', 'status', 'hasil', 'status_keputusan']);

    // ID and jalur detection (existing logic expanded)
    if (!globalCache.idColumn) {
      const idCandidates = ['pendaftaran_id', 'id', 'id_peserta', 'no_peserta', 'peserta_id', 'no_urut', 'nomor_peserta'];
      globalCache.idColumn = findCol(idCandidates);
    }
    if (!globalCache.jalurColumn) {
      globalCache.jalurColumn = findCol(['jalur', 'path', 'channel']);
    }

    // Ensure we have participant lat/lon and school name at minimum
    if (!latCol || !lonCol || !namaSekolahCol) {
      throw new Error(`Parquet schema missing required columns. Found: ${availableColumns.join(', ')}. Expected lat/lon and school name (e.g. lintang/bujur, nama_sekolah_tujuan).`);
    }

    // Build select clause using detected column names and alias to standard fields used in app
    let selectClause = `CAST("${latCol}" AS DOUBLE) as lintang, CAST("${lonCol}" AS DOUBLE) as bujur, CAST("${jenjangCol || 'NULL'}" AS VARCHAR) as jenjang, CAST("${namaSekolahCol}" AS VARCHAR) as nama_sekolah_tujuan, CAST("${statusCol || 'NULL'}" AS VARCHAR) as status_penerimaan`;
    if (schoolLatCol) selectClause += `,CAST("${schoolLatCol}" AS DOUBLE) as lintang_sekolah`;
    else selectClause += `,CAST(NULL AS DOUBLE) as lintang_sekolah`;
    if (schoolLonCol) selectClause += `,CAST("${schoolLonCol}" AS DOUBLE) as bujur_sekolah`;
    else selectClause += `,CAST(NULL AS DOUBLE) as bujur_sekolah`;
    selectClause += `,CAST(NULL AS VARCHAR) as koordinat_sekolah`;
    selectClause += `,CAST(NULL AS VARCHAR) as koordinat_peserta`;
    selectClause += `,CAST(NULL AS DOUBLE) as jarak_meter`;
    if (globalCache.idColumn) selectClause += `,CAST("${globalCache.idColumn}" AS VARCHAR) as id_peserta`;
    if (globalCache.jalurColumn) selectClause += `,CAST("${globalCache.jalurColumn}" AS VARCHAR) as jalur`;
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
