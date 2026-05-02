import { useMemo } from 'react';

export const formatCount = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)} M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
  return num.toString();
};

export const useFilterMetrics = (data) => {
  return useMemo(() => {
    if (!data || !Array.isArray(data)) {
      return {
        jenjangCounts: {},
        statusCounts: { all: 0 },
        jalurCounts: { all: 0 },
      };
    }

    const jenjangCounts = {};
    const statusCounts = { all: data.length };
    const jalurCounts = { all: data.length };

    data.forEach((row) => {
      const jenjang = String(row.jenjang || '').trim();
      const status = String(row.status_penerimaan || '').trim();
      const jalur = String(row.jalur || '').trim();

      // Count by jenjang
      if (jenjang) {
        jenjangCounts[jenjang] = (jenjangCounts[jenjang] || 0) + 1;
      }

      // Count by status
      if (status) {
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      }

      // Count by jalur
      if (jalur) {
        jalurCounts[jalur] = (jalurCounts[jalur] || 0) + 1;
      }
    });

    return {
      jenjangCounts,
      statusCounts,
      jalurCounts,
    };
  }, [data]);
};
