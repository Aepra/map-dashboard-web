import React, { useState } from 'react';

/**
 * Control Panel - Minimalist Filter UI
 */
export const ControlPanel = ({
  checkedJenjang,
  setCheckedJenjang,
  vizMode,
  setVizMode,
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
    <div className="absolute top-4 left-4 bg-white/90 rounded-lg shadow-md backdrop-blur-sm w-72 z-40 border border-gray-200">
      {/* Header with compact layout */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-900">Jenjang</div>
          <button
            onClick={() => setShowJenjangDropdown(!showJenjangDropdown)}
            className="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition border border-blue-200"
          >
            {getSelectedLabel()} {showJenjangDropdown ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showJenjangDropdown && (
        <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50 space-y-2">
          {['SD', 'SMP', 'PAUD'].map((jenjang) => (
            <label key={jenjang} className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={checkedJenjang[jenjang]}
                onChange={() => handleCheckboxChange(jenjang)}
                className="w-4 h-4 cursor-pointer accent-blue-600 rounded"
              />
              <span className="text-gray-700">
                {jenjang === 'SD' && '🔴 SD'}
                {jenjang === 'SMP' && '🔵 SMP'}
                {jenjang === 'PAUD' && '🟡 PAUD'}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Visualization Mode */}
      <div className="px-3 py-2.5 border-b border-gray-100">
        <div className="text-xs font-medium text-gray-600 mb-2">Mode</div>
        <div className="flex gap-2">
          {['normal', 'dense'].map((mode) => (
            <button
              key={mode}
              onClick={() => setVizMode(mode)}
              className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition ${
                vizMode === mode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode === 'normal' ? 'Normal' : 'Dense'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2">
        <div className="text-xs text-gray-600 flex justify-between">
          <span>{filteredCount.toLocaleString('id-ID')} dari {totalCount.toLocaleString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
};
