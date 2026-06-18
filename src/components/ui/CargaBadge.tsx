import { DotBadge } from "./Badge";
import { CARGA_COLOR, CARGA_LABEL, type CargaTrabajo } from "@/lib/types";

export function CargaBadge({ carga }: { carga: CargaTrabajo | null }) {
  if (!carga) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs font-medium text-muted">
        Sin registro
      </span>
    );
  }
  return <DotBadge color={CARGA_COLOR[carga]}>{CARGA_LABEL[carga]}</DotBadge>;
}
