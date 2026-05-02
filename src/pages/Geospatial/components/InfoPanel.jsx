/**
 * Info Panel - Display selected student or school details
 */
const missingValueLabels = new Set(['', 'na', 'n/a', 'null', '-']);

const getDisplayValue = (value) => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  if (!text || missingValueLabels.has(text.toLowerCase())) return null;
  return text;
};

const getDisplayCoordinate = (latitude, longitude) => {
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
};

export const InfoPanel = ({ selectedStudent, selectedSchool, schoolData = [], onClose }) => {
  // If no student selected but a school name is provided, show school details
  if (!selectedStudent && selectedSchool) {
    const school = (schoolData || []).find((s) => s.nama === selectedSchool) || null;
    if (!school) {
      return (
        <div className="bg-white/95 rounded-lg shadow-lg border border-gray-300 backdrop-blur-sm px-4 py-3 max-w-xs">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-bold text-gray-800">🏫 Sekolah</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-lg leading-none"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-600">Detail sekolah tidak ditemukan pada data saat ini.</div>
        </div>
      );
    }

    return (
      <div className="bg-white/95 rounded-lg shadow-lg border border-gray-300 backdrop-blur-sm px-4 py-3 max-w-xs">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-sm font-bold text-gray-800">🏫 Detail Sekolah</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2 text-[12px]">
          <div>
            <span className="text-gray-600">Nama:</span>
            <div className="font-semibold text-gray-800">{school.nama}</div>
          </div>
          
          {/* Card grid untuk statistik - Penerimaan (3 kolom) */}
          <div className="mt-3 space-y-2">
            <div className="text-xs font-bold text-gray-700">Status Penerimaan:</div>
            <div className="grid grid-cols-3 gap-2 p-2 bg-slate-50 rounded">
              <div className="text-center">
                <div className="text-xs text-gray-600">Total</div>
                <div className="font-bold text-blue-700 text-sm">{(school.totalSiswa || 0).toLocaleString('id-ID')}</div>
                <div className="text-xs text-gray-500">Pendaftar</div>
              </div>
              <div className="text-center border-l border-gray-300">
                <div className="text-xs text-gray-600">Lulus</div>
                <div className="font-bold text-green-600 text-sm">{(school.totalLulus || 0).toLocaleString('id-ID')}</div>
                <div className="text-xs text-gray-500">Diterima</div>
              </div>
              <div className="text-center border-l border-gray-300">
                <div className="text-xs text-gray-600">Tidak Lulus</div>
                <div className="font-bold text-red-600 text-sm">{(school.totalTidakLulus || 0).toLocaleString('id-ID')}</div>
                <div className="text-xs text-gray-500">Ditolak</div>
              </div>
            </div>
          </div>

          {/* Card grid untuk Verifikasi (4 kolom) */}
          <div className="mt-3 space-y-2">
            <div className="text-xs font-bold text-gray-700">Status Verifikasi:</div>
            <div className="grid grid-cols-4 gap-1 p-2 bg-slate-50 rounded">
              <div className="text-center">
                <div className="text-[11px] text-gray-600">Terverifikasi</div>
                <div className="font-bold text-blue-600 text-sm">{(school.totalTerverifikasi || 0).toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-gray-500">Valid</div>
              </div>
              <div className="text-center border-l border-gray-300">
                <div className="text-[11px] text-gray-600">Tidak Terverifikasi</div>
                <div className="font-bold text-orange-600 text-sm">{(school.totalTidakTerverifikasi || 0).toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-gray-500">Invalid</div>
              </div>
              <div className="text-center border-l border-gray-300">
                <div className="text-[11px] text-gray-600">Belum Diproses</div>
                <div className="font-bold text-yellow-600 text-sm">{(school.totalBelumDiproses || 0).toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-gray-500">Pending</div>
              </div>
              <div className="text-center border-l border-gray-300">
                <div className="text-[11px] text-gray-600">Ditolak</div>
                <div className="font-bold text-purple-600 text-sm">{(school.totalDitolak || 0).toLocaleString('id-ID')}</div>
                <div className="text-[10px] text-gray-500">Rejected</div>
              </div>
            </div>
          </div>

          {/* Jenjang Info */}
          <div className="mt-3 p-2 bg-slate-50 rounded text-center">
            <div className="text-xs font-bold text-gray-700">Jenjang Sekolah</div>
            <div className="font-semibold text-gray-800 text-sm">
              SD: {school.sdCount || 0} | SMP: {school.smpCount || 0} | PAUD: {school.paudCount || 0}
            </div>
          </div>
          
          {/* Rincian per Jalur */}
          {school.jalurBreakdown && school.jalurBreakdown.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="text-xs font-bold text-gray-700 mb-2">Rincian Jalur:</div>
              <div className="space-y-1">
                {school.jalurBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                    <span className="font-semibold text-gray-700">{item.jalur}</span>
                    <span>
                      <span className="text-green-600 font-semibold">{item.lulus}</span>
                      <span className="text-gray-500"> / </span>
                      <span className="text-red-600 font-semibold">{item.tidakLulus}</span>
                      <span className="text-gray-500 text-[11px]"> (L/TL)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {(school.lintang && school.bujur) && (
            <div className="text-gray-500 text-[11px] mt-2 pt-2 border-t border-gray-200">
              Koordinat: {Number(school.lintang).toFixed(5)}, {Number(school.bujur).toFixed(5)}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-lg shadow-lg border border-gray-300 backdrop-blur-sm px-4 py-3 max-w-xs">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-bold text-gray-800">📋 Detail Siswa</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-lg leading-none"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1.5 text-[12px]">
        <div>
          <span className="text-gray-600">ID Peserta:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.id_peserta) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-600">Kecamatan:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.kecamatan) || '-'}</div>
        </div>
        
        <div>
          <span className="text-gray-600">Desa:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.desa) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-600">Sekolah Tujuan:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.nama_sekolah_tujuan) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-600">Jarak:</span>
          <div className="font-semibold text-gray-800">
            {getDisplayValue(selectedStudent.jarak) || '-'}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Jenjang:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.jenjang) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>
          <div className={`font-semibold ${
            selectedStudent.status_penerimaan === 'Diterima'
              ? 'text-green-700'
              : selectedStudent.status_penerimaan === 'Cadangan'
              ? 'text-orange-700'
              : 'text-red-700'
          }`}>
            {getDisplayValue(selectedStudent.status_penerimaan) || '-'}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Jalur:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.jalur) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-600">Koordinat:</span>
          <div className="font-semibold text-gray-800">{getDisplayCoordinate(selectedStudent.lintang, selectedStudent.bujur) || '-'}</div>
        </div>
        {selectedStudent.id_peserta && (
          <div className="text-gray-500 text-[11px] mt-2 pt-2 border-t border-gray-200">
            ID: {getDisplayValue(selectedStudent.id_peserta)}
          </div>
        )}
      </div>
    </div>
  );
};
