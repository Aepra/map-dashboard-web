const formatK = (num) => {
  if (!num) return '0';
  return num >= 1000
    ? `${(num / 1000).toFixed(1)}K`
    : num.toLocaleString();
};

export const StatsPanel = ({ totalStats = {}, compact = false }) => {
  const safeStats = totalStats || {};

  return (
    <div
      className="bg-white/90 shadow-md backdrop-blur-sm border border-gray-200"
      style={{
        borderRadius: compact ? 8 : 12,
        padding: compact ? '4px 6px' : '10px 12px',
      }}
    >
      <div
        className="grid grid-cols-3"
        style={{ gap: compact ? 6 : 12 }}
      >

        {/* PAUD */}
        <div className="text-center">
          <div className="text-gray-600" style={{ fontSize: compact ? 9 : 12, marginBottom: compact ? 1 : 4 }}>🟡 PAUD</div>
          <div className="font-bold text-yellow-600" style={{ fontSize: compact ? 10 : 14 }}>
            {formatK(safeStats.paud)}
          </div>
        </div>

        {/* SD */}
        <div className="text-center">
          <div className="text-gray-600" style={{ fontSize: compact ? 9 : 12, marginBottom: compact ? 1 : 4 }}>🔴 SD</div>
          <div className="font-bold text-orange-600" style={{ fontSize: compact ? 10 : 14 }}>
            {formatK(safeStats.sd)}
          </div>
        </div>

        {/* SMP */}
        <div className="text-center">
          <div className="text-gray-600" style={{ fontSize: compact ? 9 : 12, marginBottom: compact ? 1 : 4 }}>🔵 SMP</div>
          <div className="font-bold text-blue-600" style={{ fontSize: compact ? 10 : 14 }}>
            {formatK(safeStats.smp)}
          </div>
        </div>
      </div>
    </div>
  );
};