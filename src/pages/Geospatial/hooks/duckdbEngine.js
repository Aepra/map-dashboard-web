// duckdbEngine.js
// Global singleton for DuckDB WASM, connection, and data cache
import * as duckdb from '@duckdb/duckdb-wasm';
import { DUCKDB_CONFIG } from '../utils/constants';

const globalCache = {
  db: null,
  conn: null,
  data: null,
  initialized: false,
  schema: null,
  idColumn: null,
  jalurColumn: null,
  parquetSource: null,
  selectClause: null, // Store the select clause for delta sync
  initPromise: null,
};

export async function initDuckDB(parquetUrl) {
  if (globalCache.initialized && globalCache.data && globalCache.parquetSource === parquetUrl) return globalCache;
  if (globalCache.initPromise && globalCache.parquetSource === parquetUrl) return globalCache.initPromise;

  // Reset cache if url changes
  if (globalCache.parquetSource && globalCache.parquetSource !== parquetUrl) {
    globalCache.data = null;
    globalCache.initialized = false;
    globalCache.schema = null;
    globalCache.idColumn = null;
    globalCache.jalurColumn = null;
    globalCache.selectClause = null;
  }

  globalCache.parquetSource = parquetUrl;

  globalCache.initPromise = (async () => {
    const logger = new duckdb.ConsoleLogger();
    const _worker = new Worker(DUCKDB_CONFIG.mainWorker);
    const _db = new duckdb.AsyncDuckDB(logger, _worker);
    await _db.instantiate(DUCKDB_CONFIG.mainModule);
    globalCache.db = _db;
    globalCache.conn = await _db.connect();
    // Fetch parquet manually using fetch() which follows redirects (GCS often redirects).
    // Then register the file as a buffer in DuckDB's virtual filesystem.
    let activeParquetAlias = null;
    let sampleResult = null;

    const fetchAndRegister = async (alias, url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} fetching parquet`);
      const buffer = await response.arrayBuffer();
      await _db.registerFileBuffer(alias, new Uint8Array(buffer));
    };

    const parquetCandidates = [
      { alias: 'data_remote.parquet', url: parquetUrl },
    ];

    for (const candidate of parquetCandidates) {
      try {
        await fetchAndRegister(candidate.alias, candidate.url);
        const probe = await globalCache.conn.query(`SELECT * FROM '${candidate.alias}' LIMIT 1`);
        activeParquetAlias = candidate.alias;
        sampleResult = probe;
        break;
      } catch {
        // Try next source
      }
    }

    if (!activeParquetAlias) {
      throw new Error(`Gagal memuat parquet dari URL: ${parquetUrl}`);
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
    const statusVerifikasiCol = findCol(['status_verifikasi', 'verifikasi', 'status_v', 'verification_status']);
    const kecamatanCol = findCol(['kecamatan', 'kec']);
    const desaCol = findCol(['desa', 'kelurahan', 'kel']);
    const jarakCol = findCol(['jarak', 'jarak_meter', 'distance', 'jarak_m']);
    const nisnCol = findCol(['nisn', 'nik', 'no_induk_siswa', 'nomor_induk']);

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

    const cleanTextExpr = (columnName) => `CASE WHEN UPPER(TRIM(CAST("${columnName}" AS VARCHAR))) IN ('NA', 'N/A', 'NULL', '-') OR TRIM(CAST("${columnName}" AS VARCHAR)) = '' THEN NULL ELSE CAST("${columnName}" AS VARCHAR) END`;
    const cleanNumberExpr = (columnName) => `CASE WHEN UPPER(TRIM(CAST("${columnName}" AS VARCHAR))) IN ('NA', 'N/A', 'NULL', '-') OR TRIM(CAST("${columnName}" AS VARCHAR)) = '' THEN NULL ELSE CAST("${columnName}" AS DOUBLE) END`;

    // Build select clause using detected column names and alias to standard fields used in app
    let selectClause = `CAST("${latCol}" AS DOUBLE) as lintang, CAST("${lonCol}" AS DOUBLE) as bujur, ${jenjangCol ? cleanTextExpr(jenjangCol) : 'CAST(NULL AS VARCHAR)'} as jenjang, ${cleanTextExpr(namaSekolahCol)} as nama_sekolah_tujuan, ${statusCol ? cleanTextExpr(statusCol) : 'CAST(NULL AS VARCHAR)'} as status_penerimaan, ${statusVerifikasiCol ? cleanTextExpr(statusVerifikasiCol) : 'CAST(NULL AS VARCHAR)'} as status_verifikasi`;
    if (kecamatanCol) selectClause += `,${cleanTextExpr(kecamatanCol)} as kecamatan`;
    else selectClause += `,CAST(NULL AS VARCHAR) as kecamatan`;
    if (desaCol) selectClause += `,${cleanTextExpr(desaCol)} as desa`;
    else selectClause += `,CAST(NULL AS VARCHAR) as desa`;
    if (schoolLatCol) selectClause += `,CAST("${schoolLatCol}" AS DOUBLE) as lintang_sekolah`;
    else selectClause += `,CAST(NULL AS DOUBLE) as lintang_sekolah`;
    if (schoolLonCol) selectClause += `,CAST("${schoolLonCol}" AS DOUBLE) as bujur_sekolah`;
    else selectClause += `,CAST(NULL AS DOUBLE) as bujur_sekolah`;
    selectClause += `,CAST(NULL AS VARCHAR) as koordinat_sekolah`;
    selectClause += `,CAST(NULL AS VARCHAR) as koordinat_peserta`;
    if (jarakCol) selectClause += `,${cleanNumberExpr(jarakCol)} as jarak`;
    else selectClause += `,CAST(NULL AS DOUBLE) as jarak`;
    if (globalCache.idColumn) selectClause += `,${cleanTextExpr(globalCache.idColumn)} as id_peserta`;
    else selectClause += `,CAST(NULL AS VARCHAR) as id_peserta`;
    if (globalCache.jalurColumn) selectClause += `,${cleanTextExpr(globalCache.jalurColumn)} as jalur`;
    else selectClause += `,CAST(NULL AS VARCHAR) as jalur`;
    if (nisnCol) selectClause += `,${cleanTextExpr(nisnCol)} as nisn`;
    else selectClause += `,CAST(NULL AS VARCHAR) as nisn`;
    
    globalCache.selectClause = selectClause;

    // Create a local table in DuckDB to hold the data, so we can insert deltas later
    const query = `SELECT ${selectClause} FROM '${activeParquetAlias}'`;
    await globalCache.conn.query(`CREATE TABLE local_students AS ${query}`);
    
    const resultAll = await globalCache.conn.query(`SELECT * FROM local_students`);
    // Store as raw array of objects (no transformation in React)
    globalCache.data = resultAll.toArray().map(row => row.toJSON());
    globalCache.initialized = true;
    return globalCache;
  })();
  return globalCache.initPromise;
}

export async function syncDeltaData(deltaUrl) {
  if (!globalCache.initialized || !deltaUrl || !globalCache.conn) return globalCache.data;
  
  const timestamp = Date.now();
  const deltaAlias = `delta_${timestamp}.parquet`;
  // Add a cache buster so the browser physically re-fetches the file
  const urlWithCacheBuster = `${deltaUrl}?t=${timestamp}`;
  
  try {
    // 1. Fetch + register delta file using buffer (handles GCS redirects)
    const response = await fetch(urlWithCacheBuster);
    if (!response.ok) throw new Error(`HTTP ${response.status} fetching delta parquet`);
    const buffer = await response.arrayBuffer();
    await globalCache.db.registerFileBuffer(deltaAlias, new Uint8Array(buffer));
    
    // UPSERT LOGIC
    // 2. Delete existing rows that match the IDs in the delta file (if an ID column exists)
    // This ensures if a student's status changes, we replace their old record.
    if (globalCache.idColumn) {
       await globalCache.conn.query(`
         DELETE FROM local_students 
         WHERE id_peserta IN (
           SELECT CASE WHEN UPPER(TRIM(CAST("${globalCache.idColumn}" AS VARCHAR))) IN ('NA', 'N/A', 'NULL', '-') OR TRIM(CAST("${globalCache.idColumn}" AS VARCHAR)) = '' THEN NULL ELSE CAST("${globalCache.idColumn}" AS VARCHAR) END 
           FROM '${deltaAlias}'
         )
       `);
    }
    
    // 3. Insert the new/updated rows from the delta file into our local table
    await globalCache.conn.query(`
      INSERT INTO local_students 
      SELECT ${globalCache.selectClause} FROM '${deltaAlias}'
    `);
    
    // 4. Re-fetch all data to update the React state
    const resultAll = await globalCache.conn.query(`SELECT * FROM local_students`);
    globalCache.data = resultAll.toArray().map(row => row.toJSON());
    
    return globalCache.data;
  } catch (err) {
    console.error("Failed to sync delta parquet:", err);
    return globalCache.data; // Fallback to existing data if the delta fails
  }
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
