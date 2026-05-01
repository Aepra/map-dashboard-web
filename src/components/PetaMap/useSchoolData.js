import { useMemo } from 'react';

/**
 * Aggregate school data from student records for sidebar display.
 */
export const useSchoolData = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    const schoolMap = new Map();

    data.forEach((student) => {
      const schoolName = student.nama_sekolah_tujuan || 'N/A';

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          nama: schoolName,
          totalSiswa: 0,
          sdCount: 0,
          smpCount: 0,
          paudCount: 0,
        });
      }

      const school = schoolMap.get(schoolName);
      school.totalSiswa += 1;

      if (student.jenjang.includes('SD')) school.sdCount += 1;
      else if (student.jenjang.includes('SMP')) school.smpCount += 1;
      else school.paudCount += 1;
    });

    const schools = Array.from(schoolMap.values());
    schools.sort((a, b) => b.totalSiswa - a.totalSiswa);

    return schools;
  }, [data]);
};
