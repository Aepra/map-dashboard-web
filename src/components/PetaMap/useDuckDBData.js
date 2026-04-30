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
      let worker = null;
      let db = null;
      let conn = null;

      try {
        setLoading(true);
        setError(null);

        console.log('🔨 Initializing DuckDB...');
        const logger = new duckdb.ConsoleLogger();
        worker = new Worker(DUCKDB_CONFIG.mainWorker);
        db = new duckdb.AsyncDuckDB(logger, worker);

        console.log('📦 Loading WASM module...');
        await db.instantiate(DUCKDB_CONFIG.mainModule);
        conn = await db.connect();
        console.log('✅ DuckDB initialized');

        console.log('📥 Registering Parquet file...');
        // Try local file first
        const localPath = '/data/peta_murid.parquet';
        console.log(`📂 Attempting to load from local: ${localPath}`);
        
        try {
          await db.registerFileURL(
            'data.parquet',
            localPath,
            duckdb.DuckDBDataProtocol.HTTP,
            false
          );
          console.log('✅ Using local parquet file');
        } catch (err) {
          console.log('⚠️ Local file not found, falling back to GitHub');
          await db.registerFileURL(
            'data.parquet',
            PARQUET_URL_GITHUB,
            duckdb.DuckDBDataProtocol.HTTP,
            false
          );
        }

        console.log('🔍 Querying Parquet data...');
        const resultAll = await conn.query(`
          SELECT 
            CAST(lintang AS DOUBLE) as lintang,
            CAST(bujur AS DOUBLE) as bujur,
            CAST(jenjang AS VARCHAR) as jenjang,
            CAST(nama_sekolah_tujuan AS VARCHAR) as nama_sekolah_tujuan,
            CAST(status_penerimaan AS VARCHAR) as status_penerimaan
          FROM 'data.parquet'
        `);

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
        setData(validRows);
        setStats(stats);
      } catch (err) {
        console.error('❌ DuckDB Error:', err);
        setError(`${err.message || 'Gagal memproses data Parquet'}`);
      } finally {
        setLoading(false);
        try {
          if (conn) await conn.close();
        } catch (e) {
          console.warn('⚠️ Error closing connection:', e);
        }
      }
    };

    initializeDuckDB();
  }, []);

  return { data, loading, error, stats };
};
