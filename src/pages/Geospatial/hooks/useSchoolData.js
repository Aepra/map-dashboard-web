import { useMemo } from 'react';

/**
 * Aggregate school data from student records for map layers and search panels.
 */
export const useSchoolData = (data) => {
  return useMemo(() => {
    if (!data || data.length === 0) return [];

    // List semua kolom untuk composite key (COUNT DISTINCT)
    const distinctColumns = [
      'waktu_pendaftaran', 'jenjang', 'jalur', 'nik', 'nisn', 'tanggal_lahir', 'kategori_usia',
      'kebutuhan_khusus', 'pendaftaran_id', 'jenis_kelamin', 'kecamatan', 'kelurahan', 'lintang', 
      'bujur', 'koordinat_peserta', 'nama_sekolah_asal', 'nama_sekolah_tujuan', 'kuota', 
      'kecamatan_sekolah', 'desa_kelurahan_sekolah', 'lintang_sekolah', 'bujur_sekolah', 
      'koordinat_sekolah', 'jarak_meter', 'status_verifikasi', 'waktu_verifikasi', 'durasi_proses', 
      'kategori_durasi_proses', 'jenis_pilihan', 'skor', 'status_penerimaan', 'uk_baju', 'uk_celana'
    ];

    // Generate composite key dari student dengan semua kolom
    const getCompositeKey = (student) => {
      return distinctColumns
        .map(col => {
          const value = student[col];
          return value === null || value === undefined ? 'NULL' : String(value).trim();
        })
        .join('|');
    };

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

    // Debug: collect unique status values
    const statusValues = new Set();

    data.forEach((student) => {
      const schoolName = student.nama_sekolah_tujuan || 'N/A';
      const jenjang = String(student.jenjang || '');
      const participantLat = normalizeNumber(student.lintang);
      const participantLon = normalizeNumber(student.bujur);
      const schoolLat = normalizeNumber(student.lintang_sekolah);
      const schoolLon = normalizeNumber(student.bujur_sekolah);
      const status = String(student.status_penerimaan || '').trim();
      const jalur = String(student.jalur || '').trim();
      const verifikasi = String(student.status_verifikasi || '').trim();
      
      // Debug: log unique status values
      if (status && status !== '') {
        statusValues.add(status);
      }

      if (!schoolMap.has(schoolName)) {
        schoolMap.set(schoolName, {
          nama: schoolName,
          schoolLatList: [],
          schoolLonList: [],
          participantLatList: [],
          participantLonList: [],
          totalSiswa: new Set(),
          sdCount: new Set(),
          smpCount: new Set(),
          paudCount: new Set(),
          totalLulus: new Set(),
          totalTidakLulus: new Set(),
          totalTerverifikasi: new Set(),
          totalTidakTerverifikasi: new Set(),
          totalBelumDiproses: new Set(),
          totalDitolak: new Set(),
          jalurMap: new Map(),
        });
      }

      const school = schoolMap.get(schoolName);
      
      // Generate composite key untuk COUNT DISTINCT
      const compositeKey = getCompositeKey(student);
      
      school.totalSiswa.add(compositeKey);
      
      // Track lulus vs tidak lulus
      const isLulus = status.toUpperCase() === 'LULUS' || 
                      status.toLowerCase() === 'lulus';
      
      const isTidakLulus = status && status !== '' && !isLulus;
      
      // Track verifikasi status dari 4 kategori: Terverifikasi, Tidak terverifikasi, Belum diproses, Ditolak
      const verifikasiUpper = verifikasi.toUpperCase();
      const isTerverifikasi = verifikasiUpper === 'TERVERIFIKASI';
      const isTidakTerverifikasi = verifikasiUpper === 'TIDAK TERVERIFIKASI';
      const isBelumDiproses = verifikasiUpper === 'BELUM DIPROSES';
      const isDitolak = verifikasiUpper === 'DITOLAK';
      
      if (compositeKey) {
        if (isLulus) {
          school.totalLulus.add(compositeKey);
        } else if (isTidakLulus) {
          school.totalTidakLulus.add(compositeKey);
        }
        
        // Track verifikasi - count all verifikasi values separately
        if (isTerverifikasi) {
          school.totalTerverifikasi.add(compositeKey);
        } else if (isTidakTerverifikasi) {
          school.totalTidakTerverifikasi.add(compositeKey);
        } else if (isBelumDiproses) {
          school.totalBelumDiproses.add(compositeKey);
        } else if (isDitolak) {
          school.totalDitolak.add(compositeKey);
        }
        
        // Track per jalur
        if (jalur && jalur !== '') {
          if (!school.jalurMap.has(jalur)) {
            school.jalurMap.set(jalur, { lulus: new Set(), tidakLulus: new Set() });
          }
          const jalurData = school.jalurMap.get(jalur);
          
          if (isLulus) {
            jalurData.lulus.add(compositeKey);
          } else if (isTidakLulus) {
            jalurData.tidakLulus.add(compositeKey);
          }
        }
      }
      
      if (schoolLat !== null) school.schoolLatList.push(schoolLat);
      if (schoolLon !== null) school.schoolLonList.push(schoolLon);
      if (participantLat !== null) school.participantLatList.push(participantLat);
      if (participantLon !== null) school.participantLonList.push(participantLon);

      // Count distinct per jenjang
      if (jenjang.includes('SD') && compositeKey) school.sdCount.add(compositeKey);
      else if (jenjang.includes('SMP') && compositeKey) school.smpCount.add(compositeKey);
      else if (compositeKey) school.paudCount.add(compositeKey);
    });

    // Debug log
    console.log('Status values found in data:', Array.from(statusValues));

    const schools = Array.from(schoolMap.values());
    schools.sort((a, b) => b.totalSiswa.size - a.totalSiswa.size);

    return schools.map((school) => {
      // Convert jalur map to array format
      const jalurBreakdown = Array.from(school.jalurMap.entries()).map(([jalurName, counts]) => ({
        jalur: jalurName,
        lulus: counts.lulus.size,
        tidakLulus: counts.tidakLulus.size,
        total: counts.lulus.size + counts.tidakLulus.size,
      })).sort((a, b) => b.total - a.total);
      
      return {
        nama: school.nama,
        lintang: pickBestCoordinate(school.schoolLatList, school.participantLatList),
        bujur: pickBestCoordinate(school.schoolLonList, school.participantLonList),
        totalSiswa: school.totalSiswa.size,
        totalLulus: school.totalLulus.size,
        totalTidakLulus: school.totalTidakLulus.size,
        totalTerverifikasi: school.totalTerverifikasi.size,
        totalTidakTerverifikasi: school.totalTidakTerverifikasi.size,
        totalBelumDiproses: school.totalBelumDiproses.size,
        totalDitolak: school.totalDitolak.size,
        sdCount: school.sdCount.size,
        smpCount: school.smpCount.size,
        paudCount: school.paudCount.size,
        jalurBreakdown: jalurBreakdown,
      };
    });
  }, [data]);
};
