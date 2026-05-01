import { useMemo } from 'react';

/**
 * Custom Hook untuk Filtering Data by multiple criteria
 * Optimized dengan useMemo - hanya recalculate saat filter atau data berubah
 */
export const useFilteredData = (data, checkedJenjang, checkedStatus, selectedSchool, checkedJalur) => {
  return useMemo(() => {
    return data.filter((d) => {
      // Check jenjang from checkboxes
      const jenjangMatch = 
        (d.jenjang && d.jenjang.includes('SD') && checkedJenjang.SD) ||
        (d.jenjang && d.jenjang.includes('SMP') && checkedJenjang.SMP) ||
        (d.jenjang && !d.jenjang.includes('SD') && !d.jenjang.includes('SMP') && checkedJenjang.PAUD);

      // Status matching: support flexible text such as 'diterima', 'lulus', 'tidak', 'tidak lulus'
      const statusText = (d.status_penerimaan || '').toString().toLowerCase();
      const wantsDiterima = !!checkedStatus?.diterima;
      const wantsTidak = !!checkedStatus?.tidak;

      // If neither status is selected, filter out all rows
      if (!wantsDiterima && !wantsTidak) return false;

      const diterimaMatch = wantsDiterima && (statusText.includes('terima') || statusText.includes('lulus'));
      const tidakMatch = wantsTidak && (statusText.includes('tidak') || statusText.includes('tidak lulus') || statusText.includes('tidaklulus'));
      const statusMatch = diterimaMatch || tidakMatch;

      const schoolMatch = !selectedSchool || d.nama_sekolah_tujuan === selectedSchool;
      let jalurMatch = true;
      if (checkedJalur && Object.keys(checkedJalur).length > 0) {
        const jalurValue = (d.jalur || '').trim();
        jalurMatch = !!checkedJalur[jalurValue];
      }
      return jenjangMatch && statusMatch && schoolMatch && jalurMatch;
    });
  }, [data, checkedJenjang, checkedStatus, selectedSchool, checkedJalur]);
};
