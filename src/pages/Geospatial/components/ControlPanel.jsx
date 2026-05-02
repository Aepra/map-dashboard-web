import React, { useState } from 'react';

/**
 * Control Panel - Minimalist Filter UI
 */
export const ControlPanel = ({
  checkedJenjang,
  setCheckedJenjang,
  vizMode,
  setVizMode,
  selectedSchool,
  filteredCount,
  totalCount,
}) => {
  const [showJenjangDropdown, setShowJenjangDropdown] = useState(false);

  const handleCheckboxChange = (jenjang) => {
    setCheckedJenjang((prev) => ({
      ...prev,
      [jenjang]: !prev[jenjang],
    }));
  };

  const getSelectedLabel = () => {
    const selected = Object.entries(checkedJenjang)
      .filter(([_, checked]) => checked)
      .map(([jenjang]) => jenjang);

    if (selected.length === 3) return 'Semua';
    if (selected.length === 0) return 'Tidak ada';
    if (selected.length === 1) return selected[0];
    return selected.join(' + ');
  };

  return (
    <div className="bg-white/95 rounded-lg shadow-lg backdrop-blur-sm w-80 border border-slate-200 overflow-hidden">
      {/* Header with compact layout */}
      <div className="px-4 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-slate-700">Pilih Jenjang</div>
          <button
            onClick={() => setShowJenjangDropdown(!showJenjangDropdown)}
            className="text-sm px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition border border-blue-200 hover:border-blue-300"
          >
            {getSelectedLabel()} {showJenjangDropdown ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showJenjangDropdown && (
        <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 space-y-2.5">
          {['SD', 'SMP', 'PAUD'].map((jenjang) => (
            <label key={jenjang} className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded-md transition">
              <input
                type="checkbox"
                checked={checkedJenjang[jenjang]}
                onChange={() => handleCheckboxChange(jenjang)}
                className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                {jenjang === 'SD' && '🔴 SD'}
                {jenjang === 'SMP' && '🔵 SMP'}
                {jenjang === 'PAUD' && '🟡 PAUD'}
              </span>
            </label>
          ))}
        </div>
      )}

      {selectedSchool && (
        <div className="px-4 py-3 border-b border-slate-200 bg-blue-50">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Sekolah Terpilih</div>
          <div className="text-sm font-semibold text-slate-900 truncate mt-1">
            {selectedSchool}
          </div>
        </div>
      )}

      {/* Visualization Mode */}
      <div className="px-4 py-3 border-b border-slate-200">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2.5">Tampilan</div>
        <div className="flex gap-2">
          {['normal', 'dense'].map((mode) => (
            <button
              key={mode}
              onClick={() => setVizMode(mode)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition ${
                vizMode === mode
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {mode === 'normal' ? 'Normal' : 'Padat'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-t border-slate-200">
        <div className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Statistik</div>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-700">{filteredCount.toLocaleString('id-ID')}</div>
            <div className="text-xs text-slate-600">dari {totalCount.toLocaleString('id-ID')} total</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-600">Persentase</div>
            <div className="text-lg font-bold text-blue-600">
              {totalCount > 0 ? ((filteredCount / totalCount) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
