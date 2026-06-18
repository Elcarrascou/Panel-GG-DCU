import { type ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  accent = false,
  tone,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: boolean;
  tone?: "alert" | "ok";
}) {
  return (
    <div
      className={`rounded-xl border bg-surface p-5 shadow-sm ${
        accent ? "border-[#8EF67C]" : "border-border"
      }`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-semibold tracking-tight ${
          tone === "alert"
            ? "text-red-600"
            : tone === "ok"
              ? "text-[#2f6b27]"
              : "text-ink"
        }`}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
