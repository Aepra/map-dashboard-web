import { useEffect, useState } from 'react';
import * as duckdb from '@duckdb/duckdb-wasm';
import { DUCKDB_CONFIG, PARQUET_URL_GITHUB } from './constants';

/**
 * Custom Hook untuk DuckDB Initialization & Parquet Data Loading
 * Currently uses GitHub URL directly for reliability
 * Once local file is downloaded via npm run download-data, will use local path
 */
export const useDuckDBData = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, sd: 0, smp: 0, paud: 0 });

  useEffect(() => {
    const initializeDuckDB = async () => {
      let _conn = null;

      try {
        setLoading(true);
        setError(null);

        console.log('🔨 Initializing DuckDB...');
        const logger = new duckdb.ConsoleLogger();
        const _worker = new Worker(DUCKDB_CONFIG.mainWorker);
        const _db = new duckdb.AsyncDuckDB(logger, _worker);

        console.log('📦 Loading WASM module...');
        await _db.instantiate(DUCKDB_CONFIG.mainModule);
        _conn = await _db.connect();
        console.log('✅ DuckDB initialized');

        console.log('📥 Registering Parquet file...');
        // Try local file first
        const localPath = '/data/peta_murid.parquet';
        console.log(`📂 Attempting to load from local: ${localPath}`);
        
        try {
          await _db.registerFileURL(
            'data.parquet',
            localPath,
            duckdb.DuckDBDataProtocol.HTTP,
            false
          );
          console.log('✅ Using local parquet file');
        } catch {
          console.log('⚠️ Local file not found, falling back to GitHub');
          await _db.registerFileURL(
            'data.parquet',
            PARQUET_URL_GITHUB,
            duckdb.DuckDBDataProtocol.HTTP,
            false
          );
        }

        console.log('🔍 Querying Parquet data...');
        
        // First, get one row to discover available columns
        let idColumn = null;
        let jalurColumn = null;
        try {
          const sampleResult = await _conn.query(`SELECT * FROM 'data.parquet' LIMIT 1`);
          const sampleRow = sampleResult.toArray()[0]?.toJSON() || {};
          const availableColumns = Object.keys(sampleRow);
          
          console.log('📋 Available columns:', availableColumns.join(', '));
          
          // Try to find the ID column (look for common naming patterns)
          const lowerCols = availableColumns.map(c => c.toLowerCase());
          if (lowerCols.includes('pendaftaran_id')) idColumn = availableColumns[lowerCols.indexOf('pendaftaran_id')];
          else if (lowerCols.includes('id')) idColumn = availableColumns[lowerCols.indexOf('id')];
          else if (lowerCols.includes('id_peserta')) idColumn = availableColumns[lowerCols.indexOf('id_peserta')];
          else if (lowerCols.includes('no_peserta')) idColumn = availableColumns[lowerCols.indexOf('no_peserta')];
          else if (lowerCols.includes('peserta_id')) idColumn = availableColumns[lowerCols.indexOf('peserta_id')];
          else if (lowerCols.includes('no_urut')) idColumn = availableColumns[lowerCols.indexOf('no_urut')];
          else if (lowerCols.includes('nomor_peserta')) idColumn = availableColumns[lowerCols.indexOf('nomor_peserta')];

          if (lowerCols.includes('jalur')) {
            jalurColumn = availableColumns[lowerCols.indexOf('jalur')];
          } else {
            const jalurIdx = lowerCols.findIndex((c) => c.includes('jalur'));
            if (jalurIdx >= 0) jalurColumn = availableColumns[jalurIdx];
          }
          
          if (idColumn) {
            console.log(`✅ Found ID column: "${idColumn}"`);
          } else {
            console.warn('⚠️ No ID column found in data. Available:', availableColumns.join(', '));
          }
        } catch (schemaError) {
          console.warn('⚠️ Could not discover schema:', schemaError.message);
        }
        
        let resultAll = null;
        try {
          // Build query with ID column if found
          let selectClause = `
            CAST(lintang AS DOUBLE) as lintang,
            CAST(bujur AS DOUBLE) as bujur,
            CAST(jenjang AS VARCHAR) as jenjang,
            CAST(nama_sekolah_tujuan AS VARCHAR) as nama_sekolah_tujuan,
            CAST(status_penerimaan AS VARCHAR) as status_penerimaan`;
          
          if (idColumn) {
            selectClause += `,\n            CAST("${idColumn}" AS VARCHAR) as id_peserta`;
          }

          if (jalurColumn) {
            selectClause += `,\n            CAST("${jalurColumn}" AS VARCHAR) as jalur`;
          } else {
            selectClause += `,\n            CAST(NULL AS VARCHAR) as jalur`;
          }
          
          const query = `SELECT ${selectClause} FROM 'data.parquet'`;
          resultAll = await _conn.query(query);
        } catch (queryError) {
          console.warn('⚠️ Query with ID column failed, trying without:', queryError.message);
          resultAll = await _conn.query(`
            SELECT 
              CAST(lintang AS DOUBLE) as lintang,
              CAST(bujur AS DOUBLE) as bujur,
              CAST(jenjang AS VARCHAR) as jenjang,
              CAST(nama_sekolah_tujuan AS VARCHAR) as nama_sekolah_tujuan,
              CAST(status_penerimaan AS VARCHAR) as status_penerimaan,
              CAST(jalur AS VARCHAR) as jalur
            FROM 'data.parquet'
          `);
        }

        // Transform & validate data
        const rows = resultAll.toArray().map((row) => {
          const obj = row.toJSON();
          return {
            ...obj,
            lintang: Number(obj.lintang) || 0,
            bujur: Number(obj.bujur) || 0,
            jenjang: String(obj.jenjang || '').trim(),
            nama_sekolah_tujuan: String(obj.nama_sekolah_tujuan || 'N/A'),
            status_penerimaan: String(obj.status_penerimaan || 'N/A'),
            jalur: String(obj.jalur || '').trim(),
            id_peserta: String(obj.id_peserta || 'N/A'),
          };
        });

        // Filter invalid coordinates
        const validRows = rows.filter(
          (r) => !isNaN(r.lintang) && !isNaN(r.bujur) && r.lintang !== 0 && r.bujur !== 0
        );

        // Calculate statistics
        const stats = {
          total: validRows.length,
          sd: validRows.filter((r) => r.jenjang.includes('SD')).length,
          smp: validRows.filter((r) => r.jenjang.includes('SMP')).length,
          paud: validRows.filter((r) => !r.jenjang.includes('SD') && !r.jenjang.includes('SMP')).length,
        };

        console.log(`✅ Loaded ${validRows.length} records`, stats);
        
        // Debug: Log first 3 records to verify id_peserta is populated
        if (validRows.length > 0) {
          console.log('🔍 Sample records with id_peserta:');
          validRows.slice(0, 3).forEach((row, i) => {
            console.log(`  [${i+1}] ID: ${row.id_peserta} | Sekolah: ${row.nama_sekolah_tujuan} | Jenjang: ${row.jenjang}`);
          });
        }
        
        setData(validRows);
        setStats(stats);
      } catch (err) {
        console.error('❌ DuckDB Error:', err);
        setError(`${err.message || 'Gagal memproses data Parquet'}`);
      } finally {
        setLoading(false);
        try {
          if (_conn) await _conn.close();
        } catch (e) {
          console.warn('⚠️ Error closing connection:', e);
        }
      }
    };

    initializeDuckDB();
  }, []);

  return { data, loading, error, stats };
};
