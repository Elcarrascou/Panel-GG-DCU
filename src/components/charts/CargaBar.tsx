import {
  CARGA_COLOR,
  CARGA_LABEL,
  CARGA_ORDEN,
  type CargaTrabajo,
} from "@/lib/types";

const SIN_COLOR = "#D1D5DB";

export function CargaBar({
  counts,
  sinRegistro = 0,
}: {
  counts: Partial<Record<CargaTrabajo, number>>;
  sinRegistro?: number;
}) {
  const segments = CARGA_ORDEN.map((c) => ({
    key: c,
    label: CARGA_LABEL[c],
    color: CARGA_COLOR[c],
    value: counts[c] ?? 0,
  }));
  if (sinRegistro > 0) {
    segments.push({
      key: "sin" as CargaTrabajo,
      label: "Sin registro",
      color: SIN_COLOR,
      value: sinRegistro,
    });
  }
  const total = segments.reduce((s, x) => s + x.value, 0);

  if (total === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted">
        Sin datos de carga para este período.
      </p>
    );
  }

  return (
    <div>
      <div className="flex h-4 w-full overflow-hidden rounded-full bg-gray-100">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              style={{
                width: `${(s.value / total) * 100}%`,
                backgroundColor: s.color,
              }}
              title={`${s.label}: ${s.value}`}
            />
          ) : null,
        )}
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        {segments.map((s) => (
          <li key={s.key} className="flex items-center gap-2 text-xs">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="text-muted">{s.label}</span>
            <span className="ml-auto font-semibold text-ink">
              {s.value}
              <span className="ml-1 font-normal text-muted">
                ({Math.round((s.value / total) * 100)}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
