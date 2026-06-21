import { tableFromArrays, tableToIPC } from 'apache-arrow';

// dataWorker.js
// Web Worker for filtering, transformation, and viewport slicing

const buildArrowIpcFromRows = (rows) => {
  if (!rows || rows.length === 0) return null;

  const columnNames = Object.keys(rows[0] || {});
  const columns = {};

  for (const columnName of columnNames) {
    columns[columnName] = new Array(rows.length);
  }

  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex];
    for (const columnName of columnNames) {
      columns[columnName][rowIndex] = row[columnName] ?? null;
    }
  }

  const table = tableFromArrays(columns);
  return tableToIPC(table, 'stream');
};

self.onmessage = function(e) {
  const { type, payload } = e.data;
  if (type === 'FILTER_VIEWPORT') {
    const { data, bounds, filters, limit } = payload;
    // bounds: { minLat, maxLat, minLng, maxLng }
    // filters: { jenjang, jalur, status, ... }
    let filtered = data;
    if (filters) {
      if (filters.jenjang) filtered = filtered.filter(r => r.jenjang === filters.jenjang);
      if (filters.jalur) filtered = filtered.filter(r => r.jalur === filters.jalur);
      if (filters.status) filtered = filtered.filter(r => r.status_penerimaan === filters.status);
    }
    if (bounds) {
      filtered = filtered.filter(r =>
        r.lintang >= bounds.minLat && r.lintang <= bounds.maxLat &&
        r.bujur >= bounds.minLng && r.bujur <= bounds.maxLng
      );
    }
    // Hard limit
    if (limit && filtered.length > limit) filtered = filtered.slice(0, limit);
    // Return only viewport data as Arrow IPC binary
    const ipcBuffer = buildArrowIpcFromRows(filtered);
    self.postMessage({ type: 'VIEWPORT_DATA', payload: ipcBuffer }, ipcBuffer ? [ipcBuffer.buffer] : []);
  }
  if (type === 'STATS') {
    const { data, filters } = payload;
    let filtered = data;
    if (filters) {
      if (filters.jenjang) filtered = filtered.filter(r => r.jenjang === filters.jenjang);
      if (filters.jalur) filtered = filtered.filter(r => r.jalur === filters.jalur);
      if (filters.status) filtered = filtered.filter(r => r.status_penerimaan === filters.status);
    }
    // Full-row uniqueness using JSON.stringify as hash
    const uniqueRows = new Set();
    const jenjangCounts = {};
    for (const row of filtered) {
      const key = JSON.stringify(row);
      if (!uniqueRows.has(key)) {
        uniqueRows.add(key);
        const j = row.jenjang;
        if (j) {
          jenjangCounts[j] = (jenjangCounts[j] || 0) + 1;
        }
      }
    }
    const stats = {
      total: uniqueRows.size,
      jenjangCounts,
    };
    self.postMessage({ type: 'STATS_RESULT', payload: stats });
  }
};
