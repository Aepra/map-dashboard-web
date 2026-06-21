/**
 * StatsPanel - Simple, minimal summary statistics.
 * Fully dynamic: renders all jenjang counts from dataset without hardcoded values.
 */

const formatCompact = (num) => {
  if (!num) return '0';
  return num >= 1000
    ? `${(num / 1000).toFixed(1)}K`
    : String(num);
};

const formatFull = (num) => {
  if (!num) return '0';
  return num.toLocaleString('id-ID');
};

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
};

const iconPool = ['🔴', '🔵', '🟡', '🟢', '🟣', '🟠', '🔶', '🔷', '🟩', '🟥', '🟦'];

const getIcon = (jenjang) => {
  if (!jenjang) return '📋';
  return iconPool[hashString(jenjang) % iconPool.length];
};

const textColors = [
  'text-red-600',
  'text-blue-600',
  'text-yellow-600',
  'text-green-600',
  'text-purple-600',
  'text-orange-600',
  'text-cyan-600',
  'text-pink-600',
  'text-teal-600',
  'text-rose-600',
  'text-amber-600',
];

const getColor = (jenjang) => {
  if (!jenjang) return 'text-gray-700';
  return textColors[hashString(jenjang) % textColors.length];
};

export const StatsPanel = ({ totalStats = {}, compact = false, totalData = 0 }) => {
  const jenjangCounts = totalStats?.jenjangCounts || {};
  const entries = Object.entries(jenjangCounts);
  const displayTotal = totalData || totalStats?.total || 0;

  return (
    <div
      className="bg-white/80 backdrop-blur-sm border border-gray-200/60"
      style={{
        borderRadius: compact ? 8 : 10,
        padding: compact ? '5px 8px' : '7px 12px',
        minWidth: compact ? 'auto' : 200,
      }}
    >
      {/* Jenjang row */}
      {entries.length > 0 && (
        <div
          style={{
            display: 'flex',
            gap: compact ? 8 : 14,
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          {entries.map(([jenjang, count]) => (
            <div key={jenjang} className="flex items-baseline gap-1">
              <span style={{ fontSize: compact ? 9 : 11 }}>{getIcon(jenjang)}</span>
              <span
                className="font-semibold text-gray-500"
                style={{ fontSize: compact ? 9 : 11 }}
              >
                {jenjang}
              </span>
              <span
                className={`font-bold ${getColor(jenjang)}`}
                style={{ fontSize: compact ? 10 : 13 }}
              >
                {compact ? formatCompact(count) : formatFull(count)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Total Pendaftar — simple, subtle */}
      <div style={{ textAlign: 'center', marginTop: entries.length > 0 ? (compact ? 2 : 4) : 0 }}>
        <span
          className="text-gray-400 font-semibold"
          style={{ fontSize: compact ? 8 : 10, letterSpacing: '0.3px' }}
        >
          TOTAL{' '}
        </span>
        <span
          className="font-bold text-blue-600"
          style={{ fontSize: compact ? 10 : 13 }}
        >
          {compact ? formatCompact(displayTotal) : formatFull(displayTotal)}
        </span>
        <span
          className="text-gray-300 font-semibold"
          style={{ fontSize: compact ? 7 : 9, marginLeft: 2 }}
        >
          PENDAFTAR
        </span>
      </div>
    </div>
  );
};