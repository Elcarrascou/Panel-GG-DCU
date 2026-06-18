export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

// Paleta corporativa derivada (verde de marca + neutros/onyx)
export const DONUT_PALETTE = [
  "#8EF67C",
  "#2F2E2E",
  "#6CD45A",
  "#9CA3AF",
  "#4B5563",
  "#C7F9BC",
  "#374151",
  "#B7E4A6",
  "#1F2937",
  "#E5E7EB",
];

export function Donut({
  slices,
  size = 180,
  thickness = 26,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
}) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">Sin datos.</p>
    );
  }

  let offset = 0;
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#F3F4F6"
          strokeWidth={thickness}
        />
        {slices.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * circ;
          const el = (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-offset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
          );
          offset += dash;
          return el;
        })}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: 26, fontWeight: 700 }}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 16}
          textAnchor="middle"
          style={{ fontSize: 11, fill: "#6B7280" }}
        >
          total
        </text>
      </svg>
      <ul className="space-y-1.5">
        {slices.map((s, i) => (
          <li key={i} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted">{s.label}</span>
            <span className="ml-2 font-semibold text-ink">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
