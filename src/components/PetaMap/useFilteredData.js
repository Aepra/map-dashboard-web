import { useMemo } from 'react';

/**
 * Custom Hook untuk Filtering Data by multiple criteria
 * Optimized dengan useMemo - hanya recalculate saat filter atau data berubah
 */
export const useFilteredData = (data, checkedJenjang, selectedStatus) => {
  return useMemo(() => {
    return data.filter((d) => {
      // Check jenjang from checkboxes
      const jenjangMatch = 
        (d.jenjang.includes('SD') && checkedJenjang.SD) ||
        (d.jenjang.includes('SMP') && checkedJenjang.SMP) ||
        (!d.jenjang.includes('SD') && !d.jenjang.includes('SMP') && checkedJenjang.PAUD);
      
      const statusMatch = selectedStatus === 'semua' || d.status_penerimaan === selectedStatus;
      return jenjangMatch && statusMatch;
    });
  }, [data, checkedJenjang, selectedStatus]);
};
