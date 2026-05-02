import { useEffect, useState, useCallback, useRef } from 'react';
import { initDuckDB, getCachedData } from './duckdbEngine';

const buildDropdownOptions = (rows = []) => {
  const jenjang = new Set();
  const status = new Set();
  const jalur = new Set();

  for (const row of rows) {
    if (row?.jenjang) jenjang.add(String(row.jenjang).trim());
    if (row?.status_penerimaan || row?.status) status.add(String(row.status_penerimaan || row.status).trim());
    if (row?.jalur) jalur.add(String(row.jalur).trim());
  }

  return {
    jenjang: [...jenjang].filter(Boolean).sort(),
    status: [...status].filter(Boolean).sort(),
    jalur: [...jalur].filter(Boolean).sort(),
  };
};

// Singleton worker
let workerInstance = null;

function getWorker() {
  if (!workerInstance) {
    workerInstance = new Worker(new URL('./dataWorker.js', import.meta.url));
  }
  return workerInstance;
}

export const useDuckDBData = (viewportBounds, filters, limit = null) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, sd: 0, smp: 0, paud: 0 });
  const [dropdownOptions, setDropdownOptions] = useState({ jenjang: [], status: [], jalur: [] });
  const [initialized, setInitialized] = useState(false);

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
        // Guard: only update if data actually changed
        if (JSON.stringify(previousDataRef.current) !== JSON.stringify(payload)) {
          previousDataRef.current = payload;
          setData(payload);
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
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await initDuckDB();

        if (!cancelled) {
          // Attach listener before marking initialized
          attachWorkerListener();

          const allData = getCachedData();
          if (allData) {
            setDropdownOptions(buildDropdownOptions(allData));
          }

          setInitialized(true);
          setLoading(false);
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
  }, [attachWorkerListener]);

  // VIEWPORT FILTERING - post message when data/bounds/filters change
  useEffect(() => {
    if (!initialized) return;

    const worker = getWorker();
    const allData = getCachedData();

    if (!allData) return;

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
  }, [initialized, viewportBounds, filters, limit]);

  // STATS - update when filters change
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
  }, [initialized, filters]);

  const reloadData = useCallback(() => {
    setLoading(true);
    setError(null);
  }, []);

  return { data, loading, error, stats, reloadData, dropdownOptions };
};