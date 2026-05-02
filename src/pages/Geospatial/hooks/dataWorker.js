// dataWorker.js
// Web Worker for filtering, transformation, and viewport slicing
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
    // Return only viewport data
    self.postMessage({ type: 'VIEWPORT_DATA', payload: filtered });
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
    let sd = 0, smp = 0, paud = 0;
    for (const row of filtered) {
      const key = JSON.stringify(row);
      if (!uniqueRows.has(key)) {
        uniqueRows.add(key);
        if (row.jenjang && row.jenjang.includes('SD')) sd++;
        else if (row.jenjang && row.jenjang.includes('SMP')) smp++;
        else paud++;
      }
    }
    const stats = {
      total: uniqueRows.size,
      sd,
      smp,
      paud,
    };
    self.postMessage({ type: 'STATS_RESULT', payload: stats });
  }
};
