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

        <div className="space-y-1.5 text-[12px]">
          <div>
            <span className="text-gray-600">Nama:</span>
            <div className="font-semibold text-gray-800">{school.nama}</div>
          </div>
          <div>
            <span className="text-gray-600">Total Siswa:</span>
            <div className="font-semibold text-blue-700">{(school.totalSiswa || 0).toLocaleString('id-ID')}</div>
          </div>
          <div className="flex gap-3">
            <div>
              <span className="text-gray-600">SD:</span>
              <div className="font-semibold text-orange-600">{school.sdCount || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">SMP:</span>
              <div className="font-semibold text-blue-600">{school.smpCount || 0}</div>
            </div>
            <div>
              <span className="text-gray-600">PAUD:</span>
              <div className="font-semibold text-yellow-600">{school.paudCount || 0}</div>
            </div>
          </div>
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
