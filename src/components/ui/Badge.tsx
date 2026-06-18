import { type ReactNode } from "react";

type Tone = "neutral" | "green" | "dark" | "amber" | "red" | "outline";

const TONES: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700",
  green: "bg-[#8EF67C]/25 text-[#2f6b27]",
  dark: "bg-onyx text-white",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  outline: "border border-border text-muted",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

// Badge con color arbitrario (usado para carga de trabajo)
export function DotBadge({
  color,
  children,
}: {
  color: string;
  children: ReactNode;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${color}22`, color: shade(color) }}
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {children}
    </span>
  );
}

// Oscurece levemente un hex para texto legible sobre fondo tintado.
function shade(hex: string): string {
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#2f2e2e";
  const r = Math.round(parseInt(c.slice(0, 2), 16) * 0.55);
  const g = Math.round(parseInt(c.slice(2, 4), 16) * 0.55);
  const b = Math.round(parseInt(c.slice(4, 6), 16) * 0.55);
  return `rgb(${r},${g},${b})`;
}
