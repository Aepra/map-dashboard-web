import { useEffect, useState, useCallback, useRef } from 'react';
import { initDuckDB, getCachedData, syncDeltaData } from './duckdbEngine';
import { tableFromIPC } from 'apache-arrow';

const buildDropdownOptions = (rows = []) => {
  const jenjang = new Set();
  const status = new Set();
  const statusVerifikasi = new Set();
  const jalur = new Set();

  for (const row of rows) {
    if (row?.jenjang) jenjang.add(String(row.jenjang).trim());
    if (row?.status_penerimaan || row?.status) status.add(String(row.status_penerimaan || row.status).trim());
    if (row?.status_verifikasi || row?.verifikasi) statusVerifikasi.add(String(row.status_verifikasi || row.verifikasi).trim());
    if (row?.jalur) jalur.add(String(row.jalur).trim());
  }

  return {
    jenjang: [...jenjang].filter(Boolean).sort(),
    status: [...status].filter(Boolean).sort(),
    statusVerifikasi: [...statusVerifikasi].filter(Boolean).sort(),
    jalur: [...jalur].filter(Boolean).sort(),
  };
};

// Singleton worker
let workerInstance = null;

function getWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./dataWorker.js', import.meta.url), { type: 'module' });
  }
  return workerInstance;
}

const arrowTableToRows = (table) => {
  if (!table || !table.schema) return [];

  const columnNames = table.schema.fields.map((field) => field.name);
  const columns = columnNames.map((_, index) => table.getChildAt(index));
  const rowCount = table.numRows || 0;
  const rows = new Array(rowCount);

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = {};
    for (let columnIndex = 0; columnIndex < columnNames.length; columnIndex += 1) {
      row[columnNames[columnIndex]] = columns[columnIndex]?.get(rowIndex) ?? null;
    }
    rows[rowIndex] = row;
  }

  return rows;
};

export const useDuckDBData = (viewportBounds, filters, limit = null, parquetUrl, deltaParquetUrl) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, jenjangCounts: {} });
  const [dropdownOptions, setDropdownOptions] = useState({ jenjang: [], status: [], statusVerifikasi: [], jalur: [] });
  const [initialized, setInitialized] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(Date.now());

  // Use refs to prevent recreating listeners
  const workerListenerAttachedRef = useRef(false);
  const previousDataRef = useRef(null);

  // Attach worker listener ONCE (singleton pattern)
  const attachWorkerListener = useCallback(() => {
    if (workerListenerAttachedRef.current) return;

    const worker = getWorker();

    worker.onmessage = (e) => {
      const { type, payload } = e.data;

      if (type === 'VIEWPORT_DATA') {
        const nextRows = payload ? arrowTableToRows(tableFromIPC(payload)) : [];

        // Guard: lightweight change detection to avoid expensive JSON.stringify
        const prev = previousDataRef.current;
        let isSame = false;
        if (prev && Array.isArray(prev) && Array.isArray(nextRows) && prev.length === nextRows.length) {
          // Compare a small sample (first few id values) to detect change quickly
          const sampleCount = Math.min(5, nextRows.length);
          isSame = true;
          for (let i = 0; i < sampleCount; i += 1) {
            const prevId = prev[i] && (prev[i].id_peserta || prev[i].id || prev[i].pendaftaran_id);
            const newId = nextRows[i] && (nextRows[i].id_peserta || nextRows[i].id || nextRows[i].pendaftaran_id);
            if (prevId !== newId) {
              isSame = false;
              break;
            }
          }
        }

        if (!isSame) {
          previousDataRef.current = nextRows;
          setData(nextRows);
        }
        setLoading(false);
      }

      if (type === 'STATS_RESULT') {
        setStats(payload);
      }
    };

    workerListenerAttachedRef.current = true;
  }, []);

  // INIT ONCE - attach listener and load DuckDB
  useEffect(() => {
    if (!parquetUrl) return;
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await initDuckDB(parquetUrl);

        if (!cancelled) {
          // Attach listener before marking initialized
          attachWorkerListener();

          const allData = getCachedData();
          if (allData) {
            setDropdownOptions(buildDropdownOptions(allData));
          }

          setInitialized(true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'DuckDB init failed');
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attachWorkerListener, parquetUrl]);

  // INCREMENTAL DELTA SYNC POLLING (every 5 mins)
  useEffect(() => {
    if (!initialized || !deltaParquetUrl) return;
    
    // Poll every 5 minutes (300,000 ms)
    const SYNC_INTERVAL = 5 * 60 * 1000;
    
    const intervalId = setInterval(async () => {
       console.log("Memulai sinkronisasi delta parquet...");
       await syncDeltaData(deltaParquetUrl);
       
       // Build new dropdown options just in case delta brings new categorical values
       const allData = getCachedData();
       if (allData) {
         setDropdownOptions(buildDropdownOptions(allData));
       }
       
       // Trigger re-render/re-filter
       setLastSyncTime(Date.now()); 
    }, SYNC_INTERVAL);
    
    return () => clearInterval(intervalId);
  }, [initialized, deltaParquetUrl]);

  // VIEWPORT FILTERING - post message when data/bounds/filters/sync change
  useEffect(() => {
    if (!initialized) return;

    const worker = getWorker();
    const allData = getCachedData(); // Uses latest from cache (including deltas)

    if (!allData) return;

    // Debounce rapid changes to avoid flooding the worker/main thread
    if (workerListenerAttachedRef.current && worker._debounceTimer) clearTimeout(worker._debounceTimer);
    worker._debounceTimer = setTimeout(() => {
      setLoading(true);
      worker.postMessage({
        type: 'FILTER_VIEWPORT',
        payload: {
          data: allData,
          bounds: viewportBounds,
          filters,
          limit,
        },
      });
    }, 120);
  }, [initialized, viewportBounds, filters, limit, lastSyncTime]);

  // STATS - update when filters or sync changes
  useEffect(() => {
    if (!initialized) return;

    const worker = getWorker();
    const allData = getCachedData();

    if (!allData) return;

    worker.postMessage({
      type: 'STATS',
      payload: {
        data: allData,
        filters,
      },
    });
  }, [initialized, filters, lastSyncTime]);

  const reloadData = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return { data, loading, error, stats, reloadData, dropdownOptions };
};