/**
 * Info Panel - Display selected student or school details
 * Fully dynamic: renders all status values and jenjang from the global dataset list.
 * Status with count 0 are shown so the user sees the complete picture.
 * No hardcoded values — reads all categories from dataset via props.
 * Grid columns adapt to item count (2/3/4 cols).
 * Labels never truncated — multi-line with word-break.
 * Responsive panel with max-height, internal scroll, and sticky header.
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

const getDisplayDistanceMeters = (distanceValue) => {
  const meters = Number(distanceValue);
  if (!Number.isFinite(meters)) return null;
  return `${Math.round(meters)} m`;
};

/**
 * Dynamic grid column helper.
 * - <= 4 items → 2 columns
 * - 5-6 items  → 3 columns
 * - >= 7 items → 4 columns
 */
const getGridColumns = (itemCount) => {
  if (itemCount >= 7) return 'grid-cols-4';
  if (itemCount >= 5) return 'grid-cols-3';
  return 'grid-cols-2';
};

/**
 * Assign a semantic color class for status badges based on keyword heuristics.
 * No hardcoded status names — uses keyword detection for visual grouping.
 *
 * HIJAU  → Lulus, Diterima, Terverifikasi, Valid
 * MERAH  → Ditolak, Rejected, Tidak Diterima, Tidak Lulus
 * KUNING → Belum Diproses, Menunggu, Pending, Berkas Belum Lengkap, Tidak Terverifikasi
 * BIRU   → fallback (default)
 *
 * Order matters:
 * 1. Check Merah first (DITOLAK, REJECTED, TIDAK LULUS, TIDAK DITERIMA)
 * 2. Check Kuning second (BELUM, MENUNGGU, PENDING, LENGKAP, TIDAK TERVERIFIKASI)
 * 2. Check Hijau third (LULUS, TERIMA, VALID, TERVERIFIKASI — excluding those with TIDAK)
 * 3. Fallback Biru
 *
 * This ordering ensures "Tidak Terverifikasi" lands in Kuning, not Hijau.
 */
const getStatusBadgeClass = (status) => {
  const upper = (status || '').toUpperCase();
  
  // === MERAH: rejection/failure ===
  if (upper.includes('DITOLAK') || upper.includes('REJECTED')) {
    return 'bg-red-50 text-red-700 border border-red-200';
  }
  // Explicit rejection: "Tidak Lulus", "Tidak Diterima"
  if (upper.includes('TIDAK LULUS') || upper.includes('TIDAK DITERIMA')) {
    return 'bg-red-50 text-red-700 border border-red-200';
  }

  // === KUNING: waiting/pending/incomplete ===
  // "Tidak Terverifikasi" → kuning (bukan gagal, hanya belum lengkap)
  if (upper.includes('TIDAK') && upper.includes('TERVERIFIKASI')) {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }
  // Waiting/pending keywords
  if (upper.includes('BELUM') || upper.includes('MENUNGGU') || upper.includes('PENDING') || upper.includes('LENGKAP')) {
    return 'bg-amber-50 text-amber-700 border border-amber-200';
  }

  // === HIJAU: positive/success ===
  // Exclude "TIDAK" prefixed variants so "Tidak Terverifikasi", "Tidak Diterima", "Tidak Lulus" are not caught here
  if (!upper.includes('TIDAK') && (upper.includes('LULUS') || upper.includes('TERIMA') || upper.includes('VALID') || upper.includes('TERVERIFIKASI'))) {
    return 'bg-green-100 text-green-800 border border-green-300';
  }
  
  // === BIRU: fallback ===
  return 'bg-blue-50 text-blue-700 border border-blue-200';
};

const getStatusIcon = (status) => {
  const upper = (status || '').toUpperCase();
  // Merah: rejection/failure
  if (upper.includes('DITOLAK') || upper.includes('REJECTED')) return '❌';
  if (upper.includes('TIDAK LULUS') || upper.includes('TIDAK DITERIMA')) return '❌';
  // Kuning: waiting/pending
  if (upper.includes('TIDAK') && upper.includes('TERVERIFIKASI')) return '⏳';
  if (upper.includes('BELUM') || upper.includes('MENUNGGU') || upper.includes('PENDING') || upper.includes('LENGKAP')) return '⏳';
  // Hijau: positive — but only if NOT prefixed with "TIDAK"
  if (!upper.includes('TIDAK') && (upper.includes('LULUS') || upper.includes('TERIMA') || upper.includes('VALID'))) return '✅';
  return '📋';
};

/**
 * StatusCard - renders a single status or jenjang with icon, label, and count.
 * Always visible even when count is 0.
 * Multi-line label with word-break — never truncated.
 */
const StatusCard = ({ statusValue, count, showCount = true }) => (
  <div className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-center ${getStatusBadgeClass(statusValue)}`}>
    <span className="text-sm leading-none">{getStatusIcon(statusValue)}</span>
    <div className="text-[11px] font-semibold leading-tight break-words whitespace-normal w-full text-center">
      {statusValue}
    </div>
    {showCount && (
      <div className="text-lg font-bold leading-tight mt-0.5">{count.toLocaleString('id-ID')}</div>
    )}
  </div>
);

/**
 * JenjangCard - renders a single jenjang with label and count.
 * Uses a distinct card style from StatusCard for visual separation.
 */
const JenjangCard = ({ value, count }) => {
  // Generate a deterministic color from the jenjang value
  const colors = [
    { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
    { bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200' },
    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  ];
  // Simple hash to pick a color
  const idx = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  const color = colors[idx];
  return (
    <div className={`flex flex-col items-center gap-0.5 p-2 rounded-lg text-center border ${color.bg} ${color.text} ${color.border}`}>
      <div className="text-[11px] font-semibold leading-tight break-words whitespace-normal w-full">{value}</div>
      <div className="text-xl font-bold leading-tight mt-0.5">{count.toLocaleString('id-ID')}</div>
    </div>
  );
};

export const InfoPanel = ({
  selectedStudent,
  selectedSchool,
  schoolData = [],
  onClose,
  allStatusPenerimaan = [],
  allStatusVerifikasi = [],
  allJenjang = [],
}) => {
  // If no student selected but a school name is provided, show school details
  if (!selectedStudent && selectedSchool) {
    const school = (schoolData || []).find((s) => s.nama === selectedSchool) || null;
    if (!school) {
      return (
        <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm px-4 py-3 min-w-[300px] max-w-sm">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-sm font-bold text-gray-800">📋 Detail Sekolah</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="text-sm text-gray-500">Detail sekolah tidak ditemukan pada data saat ini.</div>
        </div>
      );
    }

    const totalPendaftar = school.totalSiswa || 0;

    // Determine effective jenjang list: use global allJenjang if provided,
    // otherwise fall back to school's jenjangCounts keys
    const effectiveJenjangList = allJenjang.length > 0
      ? allJenjang
      : Object.keys(school.jenjangCounts || {});

    const hasOverflowContent =
      allStatusPenerimaan.length > 0 ||
      allStatusVerifikasi.length > 0 ||
      effectiveJenjangList.length > 0 ||
      (school.jalurBreakdown && school.jalurBreakdown.length > 0);

    return (
      <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm min-w-[300px] max-w-[440px] flex flex-col">
        {/* Sticky Header - always visible */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-t-xl px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="min-w-0 flex-1 mr-2">
              <h2 className="text-sm font-bold text-gray-800 break-words">🏫 {school.nama}</h2>
              {school.lintang && school.bujur && (
                <div className="text-[10px] text-gray-400 mt-0.5">{Number(school.lintang).toFixed(4)}, {Number(school.bujur).toFixed(4)}</div>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Total Pendaftar - Blue Hero Card (in header) */}
          <div className="bg-blue-50 rounded-xl p-3 mt-2 text-center border border-blue-100">
            <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Total Pendaftar</div>
            <div className="text-2xl font-extrabold text-blue-800 leading-tight">
              {totalPendaftar.toLocaleString('id-ID')}
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className={`overflow-y-auto scroll-smooth ${hasOverflowContent ? 'max-h-[55vh] md:max-h-[65vh]' : ''} px-4 py-3 space-y-3`}>
          {/* Status Penerimaan — renders ALL status from global list */}
          {allStatusPenerimaan.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status Penerimaan
              </div>
              <div className={`grid ${getGridColumns(allStatusPenerimaan.length)} gap-1.5`}>
                {allStatusPenerimaan.map((statusValue) => (
                  <StatusCard
                    key={statusValue}
                    statusValue={statusValue}
                    count={school.statusPenerimaanCounts?.[statusValue] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Status Verifikasi — renders ALL status from global list */}
          {allStatusVerifikasi.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Status Verifikasi
              </div>
              <div className={`grid ${getGridColumns(allStatusVerifikasi.length)} gap-1.5`}>
                {allStatusVerifikasi.map((statusValue) => (
                  <StatusCard
                    key={statusValue}
                    statusValue={statusValue}
                    count={school.statusVerifikasiCounts?.[statusValue] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Jenjang — dynamic card grid from jenjangCounts */}
          {effectiveJenjangList.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Jenjang
              </div>
              <div className={`grid ${getGridColumns(effectiveJenjangList.length)} gap-1.5`}>
                {effectiveJenjangList.map((jValue) => (
                  <JenjangCard
                    key={jValue}
                    value={jValue}
                    count={school.jenjangCounts?.[jValue] || 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Rincian Jalur — redesigned with per-status breakdown */}
          {school.jalurBreakdown && school.jalurBreakdown.length > 0 && (
            <div className="border-t border-gray-100 pt-2">
              <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Rincian Jalur
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {school.jalurBreakdown.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-2 border border-gray-100">
                    {/* Nama Jalur */}
                    <div className="text-xs font-bold text-gray-700 mb-1">{item.jalur}</div>
                    {/* Status breakdown per baris */}
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(item.statusCounts).map(([statusVal, count]) => (
                        <span
                          key={statusVal}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${getStatusBadgeClass(statusVal)}`}
                        >
                          {getStatusIcon(statusVal)}
                          <span>{count.toLocaleString('id-ID')}</span>
                          <span className="opacity-70 font-normal">{statusVal}</span>
                        </span>
                      ))}
                      {/* Total badge */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                        📊 Total {item.total.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // === STUDENT DETAIL VIEW ===
  return (
    <div className="bg-white/95 rounded-xl shadow-lg border border-gray-200 backdrop-blur-sm min-w-[280px] max-w-xs flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm rounded-t-xl px-4 pt-3 pb-2 border-b border-gray-100">
        <div className="flex justify-between items-start">
          <h2 className="text-sm font-bold text-gray-800">📄 Detail Siswa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none shrink-0 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="overflow-y-auto max-h-[50vh] md:max-h-[60vh] px-4 py-3 space-y-1.5 text-[12px]">
        {/* Status penerimaan — highlighted with badge */}
        {getDisplayValue(selectedStudent.status_penerimaan) && (
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold ${getStatusBadgeClass(selectedStudent.status_penerimaan)}`}>
              {getStatusIcon(selectedStudent.status_penerimaan)} {getDisplayValue(selectedStudent.status_penerimaan)}
            </span>
          </div>
        )}
        <div>
          <span className="text-gray-500">ID Peserta:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.id_peserta) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Kecamatan:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.kecamatan) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Desa:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.desa) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Sekolah Tujuan:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.nama_sekolah_tujuan) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Jarak:</span>
          <div className="font-semibold text-gray-800">
            {getDisplayDistanceMeters(selectedStudent.jarak_meter ?? selectedStudent.jarak) || '-'}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Jenjang:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.jenjang) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Jalur:</span>
          <div className="font-semibold text-gray-800">{getDisplayValue(selectedStudent.jalur) || '-'}</div>
        </div>
        <div>
          <span className="text-gray-500">Koordinat:</span>
          <div className="font-semibold text-gray-800">{getDisplayCoordinate(selectedStudent.lintang, selectedStudent.bujur) || '-'}</div>
        </div>
      </div>
    </div>
  );
};