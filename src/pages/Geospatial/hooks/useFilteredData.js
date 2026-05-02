import { useMemo } from 'react';

/**
 * Custom Hook untuk Filtering Data by multiple criteria
 * Optimized dengan useMemo - hanya recalculate saat filter atau data berubah
 */
export const useFilteredData = (data, filters = {}) => {
  const {
    checkedJenjang = {},
    checkedStatus = {},
    selectedSchool = null,
    checkedJalur = {},
  } = filters;

  return useMemo(() => {
    if (!Array.isArray(data)) return [];

    return data.filter((d) => {
      // NORMALIZE helper
      const normalize = (v) => (v || '').toString().toLowerCase().trim();

      // ✅ JENJANG
      const jenjangValue = normalize(d.jenjang);
      const jenjangMatch =
        Object.keys(checkedJenjang).length === 0 ||
        Object.keys(checkedJenjang).some(
          (key) => normalize(key) === jenjangValue
        );

      // ✅ STATUS
      const statusValue = normalize(d.status_penerimaan);
      const statusMatch =
        Object.keys(checkedStatus).length === 0 ||
        Object.keys(checkedStatus).some(
          (key) => normalize(key) === statusValue
        );

      // ✅ SCHOOL
      const schoolMatch =
        !selectedSchool ||
        normalize(d.nama_sekolah_tujuan) === normalize(selectedSchool);

      // ✅ JALUR
      const jalurValue = normalize(d.jalur);
      const jalurMatch =
        Object.keys(checkedJalur).length === 0 ||
        Object.keys(checkedJalur).some(
          (key) => normalize(key) === jalurValue
        );

      return jenjangMatch && statusMatch && schoolMatch && jalurMatch;
    });
  }, [data, checkedJenjang, checkedStatus, selectedSchool, checkedJalur]);
};