/**
 * Info Panel - Display selected student or school details
 */
export const InfoPanel = ({ selectedStudent, selectedSchool, onClose }) => {
  if (!selectedStudent) {
    return (
      <div className="bg-white/90 rounded-lg shadow-md border border-gray-200 backdrop-blur-sm px-3 py-2">
        <h2 className="text-sm font-bold text-gray-800">ℹ️ Detail</h2>
        <p className="text-[11px] text-gray-500 mt-1">Klik siswa untuk lihat detail</p>
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
          <span className="text-gray-600">Sekolah:</span>
          <div className="font-semibold text-gray-800">{selectedStudent.nama_sekolah_tujuan || 'N/A'}</div>
        </div>
        <div>
          <span className="text-gray-600">Jenjang:</span>
          <div className="font-semibold text-gray-800">{selectedStudent.jenjang || 'N/A'}</div>
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
            {selectedStudent.status_penerimaan || 'N/A'}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Jalur:</span>
          <div className="font-semibold text-gray-800">{selectedStudent.jalur || 'N/A'}</div>
        </div>
        {selectedStudent.id_peserta && (
          <div className="text-gray-500 text-[11px] mt-2 pt-2 border-t border-gray-200">
            ID: {selectedStudent.id_peserta}
          </div>
        )}
      </div>
    </div>
  );
};
