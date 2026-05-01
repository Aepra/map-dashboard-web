import { useMemo } from 'react';

/**
 * Aggregate school data from student records for map layers and search panels.
 */
export const useSchoolData = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const schoolMap = new Map();

    const getMedian = (values) => {
      if (!values.length) return 0;
      const sorted = [...values].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 === 0) return (sorted[mid - 1] + sorted[mid]) / 2;
      return sorted[mid];
    };

    data.forEach((student) => {
      const schoolName = student.nama_sekolah_tujuan || 'N/A';
      const jenjang = String(student.jenjang || '');
      const lintang = Number(student.lintang) || 0;
      const bujur = Number(student.bujur) || 0;

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          nama: schoolName,
          lintangList: [],
          bujurList: [],
          totalSiswa: 0,
          sdCount: 0,
          smpCount: 0,
          paudCount: 0,
        });
      }

      const school = schoolMap.get(schoolName);
      school.totalSiswa += 1;
      school.lintangList.push(lintang);
      school.bujurList.push(bujur);

      if (jenjang.includes('SD')) school.sdCount += 1;
      else if (jenjang.includes('SMP')) school.smpCount += 1;
      else school.paudCount += 1;
    });

    const schools = Array.from(schoolMap.values());
    schools.sort((a, b) => b.totalSiswa - a.totalSiswa);

    return schools.map((school) => ({
      nama: school.nama,
      lintang: getMedian(school.lintangList),
      bujur: getMedian(school.bujurList),
      totalSiswa: school.totalSiswa,
      sdCount: school.sdCount,
      smpCount: school.smpCount,
      paudCount: school.paudCount,
    }));
  }, [data]);
};
