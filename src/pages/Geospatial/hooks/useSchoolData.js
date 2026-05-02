import { useMemo } from 'react';

/**
 * Aggregate school data from student records for map layers and search panels.
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
      const jenjang = String(student.jenjang || '');
      const participantLat = normalizeNumber(student.lintang);
      const participantLon = normalizeNumber(student.bujur);
      const schoolLat = normalizeNumber(student.lintang_sekolah);
      const schoolLon = normalizeNumber(student.bujur_sekolah);

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          nama: schoolName,
          schoolLatList: [],
          schoolLonList: [],
          participantLatList: [],
          participantLonList: [],
          totalSiswa: 0,
          sdCount: 0,
          smpCount: 0,
          paudCount: 0,
        });
      }

      const school = schoolMap.get(schoolName);
      school.totalSiswa += 1;
  if (schoolLat !== null) school.schoolLatList.push(schoolLat);
  if (schoolLon !== null) school.schoolLonList.push(schoolLon);
  if (participantLat !== null) school.participantLatList.push(participantLat);
  if (participantLon !== null) school.participantLonList.push(participantLon);

      if (jenjang.includes('SD')) school.sdCount += 1;
      else if (jenjang.includes('SMP')) school.smpCount += 1;
      else school.paudCount += 1;
    });

    const schools = Array.from(schoolMap.values());
    schools.sort((a, b) => b.totalSiswa - a.totalSiswa);

    return schools.map((school) => ({
      nama: school.nama,
      lintang: pickBestCoordinate(school.schoolLatList, school.participantLatList),
      bujur: pickBestCoordinate(school.schoolLonList, school.participantLonList),
      totalSiswa: school.totalSiswa,
      sdCount: school.sdCount,
      smpCount: school.smpCount,
      paudCount: school.paudCount,
    }));
  }, [data]);
};
