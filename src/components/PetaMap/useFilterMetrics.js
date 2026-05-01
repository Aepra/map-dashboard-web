import { useMemo } from 'react';

export const formatCount = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)} M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
  return num.toString();
};

export const useFilterMetrics = (data) => {
  return useMemo(() => {
    const jenjangCounts = { SD: 0, SMP: 0, PAUD: 0 };
    const statusCounts = { diterima: 0, tidak: 0 };
    const jalurCounts = {};
    const jalurSet = new Set();

    data.forEach((row) => {
      const jenjang = String(row.jenjang || '');
      const statusText = String(row.status_penerimaan || '').toLowerCase();
      const jalur = String(row.jalur || '').trim();

      if (jenjang.includes('SD')) jenjangCounts.SD += 1;
      if (jenjang.includes('SMP')) jenjangCounts.SMP += 1;
      if (jenjang.includes('PAUD') || (!jenjang.includes('SD') && !jenjang.includes('SMP'))) {
        jenjangCounts.PAUD += 1;
      }

      if (statusText.includes('terima') || statusText.includes('lulus')) statusCounts.diterima += 1;
      if (statusText.includes('tidak')) statusCounts.tidak += 1;

      if (jalur) {
        jalurSet.add(jalur);
        jalurCounts[jalur] = (jalurCounts[jalur] || 0) + 1;
      }
    });

    return {
      jenjangCounts,
      statusCounts,
      jalurOptions: Array.from(jalurSet).sort(),
      jalurCounts,
    };
  }, [data]);
};
