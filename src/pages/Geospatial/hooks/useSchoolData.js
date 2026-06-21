import { useMemo } from 'react';

/**
 * Aggregate school data from student records for map layers and search panels.
 * Fully dynamic: all status values and jenjang are read directly from dataset.
 * No hardcoded values for SD/SMP/PAUD or status categories.
 *
 * UNIT DATA: "pendaftaran" — uniqueKey = pendaftaran_id
 * 1 baris data = 1 pendaftaran unik.
 * 1 siswa (nisn) boleh muncul >1x jika mendaftar lebih dari sekali.
 * Semua agregasi menggunakan Set(pendaftaran_id) untuk konsistensi mutlak.
 * TIDAK ADA per-row increment ((count || 0) + 1) — semua menggunakan Set.size.
 */
export const useSchoolData = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const schoolMap = new Map();

    const normalizeNumber = (value) => {
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const pickBestCoordinate = (values, fallbackValues = []) => {
      const validValues = values.filter((value) => Number.isFinite(value) && value !== 0);
      if (validValues.length > 0) {
        const first = validValues[0];
        const allSame = validValues.every((value) => value === first);
        if (allSame) return first;

        // Use median only when source rows disagree, so the displayed point stays stable.
        const sorted = [...validValues].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      }

      const fallbackValid = fallbackValues.filter((value) => Number.isFinite(value) && value !== 0);
      if (fallbackValid.length === 0) return null;
      const first = fallbackValid[0];
      const allSame = fallbackValid.every((value) => value === first);
      if (allSame) return first;

      const sorted = [...fallbackValid].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    };

    data.forEach((student) => {
      const schoolName = student.nama_sekolah_tujuan || 'N/A';
      const jenjang = String(student.jenjang || '').trim();
      const participantLat = normalizeNumber(student.lintang);
      const participantLon = normalizeNumber(student.bujur);
      const schoolLat = normalizeNumber(student.lintang_sekolah);
      const schoolLon = normalizeNumber(student.bujur_sekolah);
      const statusPenerimaan = String(student.status_penerimaan || '').trim();
      const statusVerifikasi = String(student.status_verifikasi || '').trim();
      const jalur = String(student.jalur || '').trim();

      // Unique key: pendaftaran_id (primary key setiap baris = 1 pendaftaran)
      const uniqueKey = String(student.pendaftaran_id || student.id_peserta || student.id || '').trim();

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          nama: schoolName,
          schoolLatList: [],
          schoolLonList: [],
          participantLatList: [],
          participantLonList: [],
          // Semua agregasi menggunakan Set(uniqueKey) — bukan increment mentah
          setTotal: new Set(),
          statusPenerimaanSets: {},
          statusVerifikasiSets: {},
          jenjangSets: {},
          jalurMap: new Map(),
        });
      }

      const school = schoolMap.get(schoolName);

      if (uniqueKey) {
        school.setTotal.add(uniqueKey);

        // Dynamic jenjang — Set-based deduplikasi
        if (jenjang) {
          if (!school.jenjangSets[jenjang]) {
            school.jenjangSets[jenjang] = new Set();
          }
          school.jenjangSets[jenjang].add(uniqueKey);
        }

        // Dynamic status penerimaan — Set-based deduplikasi
        if (statusPenerimaan) {
          if (!school.statusPenerimaanSets[statusPenerimaan]) {
            school.statusPenerimaanSets[statusPenerimaan] = new Set();
          }
          school.statusPenerimaanSets[statusPenerimaan].add(uniqueKey);
        }

        // Dynamic status verifikasi — Set-based deduplikasi
        if (statusVerifikasi) {
          if (!school.statusVerifikasiSets[statusVerifikasi]) {
            school.statusVerifikasiSets[statusVerifikasi] = new Set();
          }
          school.statusVerifikasiSets[statusVerifikasi].add(uniqueKey);
        }

        // Track per jalur — Set-based deduplikasi
        if (jalur && jalur !== '') {
          if (!school.jalurMap.has(jalur)) {
            school.jalurMap.set(jalur, {});
          }
          const jalurData = school.jalurMap.get(jalur);

          if (statusPenerimaan) {
            if (!jalurData[statusPenerimaan]) {
              jalurData[statusPenerimaan] = new Set();
            }
            jalurData[statusPenerimaan].add(uniqueKey);
          }
        }
      }

      if (schoolLat !== null) school.schoolLatList.push(schoolLat);
      if (schoolLon !== null) school.schoolLonList.push(schoolLon);
      if (participantLat !== null) school.participantLatList.push(participantLat);
      if (participantLon !== null) school.participantLonList.push(participantLon);
    });

    const schools = Array.from(schoolMap.values());
    schools.sort((a, b) => b.setTotal.size - a.setTotal.size);

    return schools.map((school) => {
      // Convert jalur map to array format — fully dynamic, no hardcoded keys
      const jalurBreakdown = Array.from(school.jalurMap.entries()).map(([jalurName, statusMap]) => {
        const statusCounts = {};
        let total = 0;
        for (const [statusValue, idSet] of Object.entries(statusMap)) {
          statusCounts[statusValue] = idSet.size;
          total += idSet.size;
        }
        return { jalur: jalurName, statusCounts, total };
      }).sort((a, b) => b.total - a.total);

      // Convert semua Set ke .size
      const statusPenerimaanCounts = {};
      for (const [key, setVal] of Object.entries(school.statusPenerimaanSets)) {
        statusPenerimaanCounts[key] = setVal.size;
      }

      const statusVerifikasiCounts = {};
      for (const [key, setVal] of Object.entries(school.statusVerifikasiSets)) {
        statusVerifikasiCounts[key] = setVal.size;
      }

      const jenjangCounts = {};
      for (const [key, setVal] of Object.entries(school.jenjangSets)) {
        jenjangCounts[key] = setVal.size;
      }

      return {
        nama: school.nama,
        lintang: pickBestCoordinate(school.schoolLatList, school.participantLatList),
        bujur: pickBestCoordinate(school.schoolLonList, school.participantLonList),
        totalSiswa: school.setTotal.size,
        statusPenerimaanCounts,
        statusVerifikasiCounts,
        jenjangCounts,
        jalurBreakdown,
      };
    });
  }, [data]);
};